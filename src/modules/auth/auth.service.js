import { trusted } from "mongoose";
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
  verifyToken,
} from "../../common/index.js";
import {
  otpRepository,
  tokenRepository,
  userRepository,
} from "../../DB/index.js";
import { checkUserExist, createUser } from "../user/user.service.js";
import appConfig from "../../../config/config.service.js";
//changed to declaration function because of TDZ which means Temporal Dead Zone or transfer it to the top
export const sendOTP = async (req) => {
  //existing valid otp?
  const otpDoc = await otpRepository.getOne({ email: req.body.email });
  if (otpDoc)
    throw new BadRequestException("OTP already sent, and still valid");
  //create new otp
  const otp = Math.floor(100000 + Math.random() * 900000); //numbers between 0 to 1
  //save into db
  await otpRepository.create({
    email: req.body.email,
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });
  //send email with the new otp
  sendMail({
    to: req.body.email,
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

  //send otp (min number - random number 0 to 1 - max number)
  return await createUser(req.body);
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
  //generate token
  const tokens = generateToken({ sub: userExist._id, role: userExist.role });
  return tokens;
};

export const verifyAccount = async (req) => {
  const { otp, email } = req.body;
  //check otp existance
  const otpDoc = await otpRepository.getOne({ email });
  if (!otpDoc) throw new BadRequestException("Expired OTP!");
  //compare 2 otps and update attempts
  if (otpDoc.otp !== otp) {
    otpDoc.attempts += 1;
    if (otpDoc.attempts > 3) {
      await otpRepository.deleteOne({ _id: otpDoc._id });

      throw new BadRequestException("Too many attempts, resend OTP");
    }
    otpDoc.save();
    throw new BadRequestException("Invalid OTP");
  }
  //update user verification
  await userRepository.update({ email }, { isVerified: true });
  //delete otp if verified
  await otpRepository.deleteOne({ _id: otpDoc._id });
  return true;
};

export const refreshToken = async (req) => {
  //get headers
  const { authorization } = req.headers; //refresh token
  //check token validation and expiration
  const payload = verifyToken(authorization, appConfig.jwtRefreshSecret);
  //get profile and check token invalidation through logoutAllDevices
  //Bug from instructor (solved)
  const user = await checkUserExist({ _id: payload.sub });
  if (!user) throw new NotFoundException("user not found");
  if (new Date(user.credentialsUpdatedAt).getTime() > payload.iat * 1000) {
    throw new BadRequestException("invalid token");
  }
  //prepare refresh token
  delete payload.iat;
  delete payload.exp;
  //generate access token
  const tokens = generateToken(payload);
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
  return await tokenRepository.create({
    token: payload.jti,
    userId: payload.sub,
    expiresAt: payload.exp * 1000, //same as expiration date in ms till invalidation
  });
};
