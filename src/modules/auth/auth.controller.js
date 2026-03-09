import { Router } from "express";
import {
  checkUserExist,
  createUser,
  updateUser,
} from "../user/user.service.js";
import {
  BadRequestException,
  ConflictException,
  SYS_MESSAGE,
  SYS_ROLE,
  compare,
  decryption,
  generateOTP,
  generateToken,
  hash,
  sendOTP,
} from "../../common/index.js";
import { encryption } from "../../common/index.js";
import jwt from "jsonwebtoken";
import appConfig from "../../../config/config.service.js";
import { signinSchema, signupSchema } from "./auth.validation.js";
import { isValid } from "../../middlewares/validation.middleware.js";

const router = Router();
//url kebab case
router.post("/signup", isValid(signupSchema), async (req, res, next) => {
  const { email, phoneNumber } = req.body;

  const userExist = await checkUserExist({
    $or: [
      { email: { $eq: email, $exists: true, $ne: null } },
      { phoneNumber: { $eq: phoneNumber, $exists: true, $ne: null } },
    ],
  });

  if (userExist) throw new ConflictException(SYS_MESSAGE.user.alreadyExist);
  //prepare data
  req.body.role = SYS_ROLE.user;
  req.body.password = await hash(req.body.password);
  if (req.body.phoneNumber) {
    req.body.phoneNumber = encryption(req.body.phoneNumber);
  }

  //OTP LAYER
  req.body.otp = `${generateOTP()}`;
  req.body.otpExpireAt = new Date(Date.now() + 5 * 60 * 1000);
  await sendOTP(email, req.body.otp);
console.log(req.body.otp)
  req.body.otp = encryption(req.body.otp);
  //create user
  await createUser(req.body);

  return res.status(201).json({
    message: SYS_MESSAGE.user.created,
    success: true,
    data: {
      // createdUser,
      message: "otp is send to mail",
    },
  });
});

router.post("/verify-otp", async (req, res, next) => {
  const { email, phoneNumber, otp } = req.body;
  const userExist = await checkUserExist({
    $or: [
      { email: { $eq: email, $exists: true, $ne: null } },
      { phoneNumber: { $eq: phoneNumber, $exists: true, $ne: null } },
    ],
  });
  userExist.otp = decryption(userExist.otp);
  if (!userExist) throw new ConflictException(SYS_MESSAGE.user.alreadyExist);
  if (userExist.otp !== otp) throw new BadRequestException("invalid otp");
  if (userExist.otpExpireAt < new Date())
    throw new BadRequestException("otp expired");
  updateUser({ _id: userExist._id }, { $unset: { otp: 1, otpExpireAt: 1 } });
  userExist.isVerified = true;
  await userExist.save();
  return res.status(200).json({
    message: "otp verified successfully",
    success: true,
  });
});

router.post("/signin", isValid(signinSchema), async (req, res, next) => {
  //apply validation first of everything

  //check user exist
  const userExist = await checkUserExist({
    email: { $eq: req.body.email, $exists: true, $ne: null },
  });
//check verification of account
if (!userExist.isVerified) throw new BadRequestException("account not verified");
  //check password
  const isPasswordMatch = await compare(
    req.body.password,
    userExist?.password ||
      "$2b$10$pQLVidtrw2tif86DRzs.UuBkNgfPBGRZAPGXfw02XQCcOOcyc2jt6",
  );
  if (!userExist) throw new BadRequestException("Invalid credentials");
  if (!isPasswordMatch) throw new BadRequestException("Invalid credentials");
  //generate token
  const tokens = generateToken({ sub: userExist._id, role: userExist.role });
  //send response
  return res.status(200).json({
    message: "login successfully",
    success: true,
    tokens: tokens,
  });
});
router.get("/refresh-token", (req, res, next) => {
  //get headers
  const { authorization } = req.headers; //refresh token
  //check token validation and expiration
  const payload = jwt.verify(authorization, appConfig.jwtRefreshSecret);
  //prepare refresh token
  delete payload.iat;
  delete payload.exp;
  //generate access token
  const tokens = generateToken(payload);

  return res.status(200).json({
    message: "refresh token successfully",
    success: true,
    tokens: tokens,
  });
});
export default router;
