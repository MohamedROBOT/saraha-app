import {
  BadRequestException,
  compare,
  ConflictException,
  encryption,
  generateToken,
  hash,
  NotFoundException,
  sendMail,
  SYS_MAIL_OTP,
  SYS_MESSAGE,
  SYS_ROLE,
  UnauthorizedException,
  verifyToken,
} from "../../common/index.js";
import { userRepository } from "../../DB/index.js";
import { checkUserExist, createUser } from "../user/user.service.js";
import appConfig from "../../../config/config.service.js";
import { OAuth2Client } from "google-auth-library";
import { redisClient } from "../../DB/redis.connection.js";
import { randomUUID } from "crypto";
//changed to declaration function because of TDZ which means Temporal Dead Zone or transfer it to the top
export const sendOTP = async (req) => {
  const { email } = req.body;
  //existing valid otp?
  const validOTP = await redisClient.exists(`${email}:otp`);

  if (validOTP)
    throw new BadRequestException("OTP already sent, and still valid");
  //create new otp
  const otp = Math.floor(100000 + Math.random() * 900000); //numbers between 0 to 1
  //save otp into cache
  redisClient.set(`${email}:otp`, otp, {
    expiration: {
      type: "EX",
      value: 1 * 60, //1 minute
    },
  });
  //send email with the new otp
  sendMail({
    to: email,
    subject: "Verify Your Account",
    html: SYS_MAIL_OTP(otp),
  });
};

export const signup = async (req) => {
  const { email, phoneNumber } = req.body;

  const userExist = await checkUserExist({
    $or: [
      { email: { $eq: email, $exists: true, $ne: null } },
      { phoneNumber: { $eq: phoneNumber, $exists: true, $ne: null } },
    ],
  });
  await sendOTP(req);
  if (userExist) throw new ConflictException(SYS_MESSAGE.user.alreadyExist);
  //prepare data
  req.body.role = SYS_ROLE.user;
  req.body.password = await hash(req.body.password);
  if (req.body.phoneNumber) {
    req.body.phoneNumber = encryption(req.body.phoneNumber);
  }

  // return await createUser(req.body);
  await redisClient.set(email, JSON.stringify(req.body), {
    expiration: {
      type: "EX",
      value: 1 * 24 * 60 * 60,
    },
  }); //store data in cache
};

export const login = async (req) => {
  //check user exist
  const userExist = await checkUserExist({
    email: { $eq: req.body.email, $exists: true, $ne: null },
  });

  //check password
  const isPasswordMatch = await compare(
    req.body.password,
    userExist?.password ||
      "$2b$10$pQLVidtrw2tif86DRzs.UuBkNgfPBGRZAPGXfw02XQCcOOcyc2jt6",
  );
  if (!userExist) throw new BadRequestException("Invalid credentials");
  if (!isPasswordMatch) throw new BadRequestException("Invalid credentials");
  //check verification of account
  if (!userExist.isVerified)
    throw new BadRequestException("account not verified");
  //generate random id
  const sessionId = randomUUID();
  //generate token
  const tokens = generateToken({ sub: userExist._id, role: userExist.role });
  await redisClient.set(
    `refreshToken:${userExist._id}:${sessionId}`,
    tokens.refreshToken,
    {
      expiration: {
        type: "EX",
        value: 365 * 24 * 60 * 60,
      },
    },
  );
  return { ...tokens, sessionId };
};

export const verifyAccount = async (req) => {
  const { otp, email } = req.body;
  //check otp existance in cache
  const validOtp = await redisClient.get(`${email}:otp`);
  if (!validOtp) throw new BadRequestException("Expired OTP!");
  //compare 2 otps and update attempts
  if (validOtp !== otp) {
    // otpDoc.attempts += 1;
    // if (otpDoc.attempts > 3) {
    //   await otpRepository.deleteOne({ _id: otpDoc._id });

    //   throw new BadRequestException("Too many attempts, resend OTP");
    // }
    // otpDoc.save();
    throw new BadRequestException("Invalid OTP");
  }
  //store user data from caching
  //get data from cache
  const userData = JSON.parse(await redisClient.get(email));
  //store cached data into DB
  await userRepository.create(userData);
  //delete used data from cache immediately
  await redisClient.del(email);
  await redisClient.del(`${email}:otp`);

  return true;
};

export const refreshToken = async (req) => {
  
  //get headers
  const { authorization, sessionid } = req.headers; //refresh token

  //check token validation and expiration
  const payload = verifyToken(authorization, appConfig.jwtRefreshSecret);
  //get profile and check token invalidation through logoutAllDevices
  //Bug from instructor (solved)
  const user = await checkUserExist({ _id: payload.sub });
  if (!user) throw new NotFoundException("user not found");
  if (new Date(user.credentialsUpdatedAt).getTime() > payload.iat * 1000) {
    throw new BadRequestException("invalid token");
  }
  //get cached token
  const cachedToken = await redisClient.get(`refreshToken:${payload.sub}:${sessionid}`);
  if (!cachedToken || cachedToken !== authorization) {
    await logoutFromAllDevices({ _id: payload.sub });
    await redisClient.del(`refreshToken:${payload.sub}:${sessionid}`);
    throw new UnauthorizedException("You are not authorized");
  }
  //prepare refresh token
  delete payload.iat;
  delete payload.exp;
  //generate access token
  const tokens = generateToken(payload);
  //store refresh token in cache
  await redisClient.set(`refreshToken:${payload.sub}:${sessionid}`, tokens.refreshToken, {
    expiration: {
      type: "EX",
      value: 365 * 24 * 60 * 60,
    },
  });

  return tokens;
};

export const logoutFromAllDevices = async (user) => {
  await userRepository.update(
    { _id: user._id },
    { credentialsUpdatedAt: Date.now() },
  );

  return true;
};

export const logout = async (payload) => {
  // return await tokenRepository.create({
  //   token: payload.jti,
  //   userId: payload.sub,
  //   expiresAt: payload.exp * 1000, //same as expiration date in ms till invalidation
  // });
  //blocked token
  
  redisClient.set(`bl${payload.jti}`, payload.jti, {
    expiration: {
      type: "EX",
      value: Math.floor(
        (new Date(payload.exp * 1000).getTime() - Date.now()) / 1000,
      ),
    },
  });
};

const googleVerifyToken = async (idToken) => {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: appConfig.googleClientId,
  });

  return ticket.getPayload();
};
export const loginWithGoogle = async (idToken) => {
  //verify token from google
  const payload = await googleVerifyToken(idToken);

  if (!payload.email_verified)
    throw new BadRequestException("refused by google");
  //create user if not exist
  const user = await checkUserExist({ email: payload.email });
  if (!user) {
    const createdUser = await createUser({
      email: payload.email,
      profilePicture: payload.picture,
      userName: payload.name,
      isEmailVerified: true,
      provider: "google",
    });
    return generateToken({
      sub: createdUser._id,
      role: createdUser.role,
      provider: createdUser.provider,
    });
  }
  //generate token
  return generateToken({
    sub: user._id,
    role: user.role,
    provider: user.provider,
  });
};
