import joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";
export const signupSchema = joi
  .object({
    userName: generalFields.userName,
    email: generalFields.email,
    phoneNumber: generalFields.phoneNumber,
    gender: generalFields.gender,
    role: generalFields.role,
    password: generalFields.password,
    rePassword: generalFields.rePassword,
  })
  .required()
  .messages({
    "any.required": "Signup payload is required",
    "object.unknown": "Invalid signup payload",
  });

export const signinSchema = joi
  .object({
    email: generalFields.email,
    password: generalFields.password,
  })
  .required()
  .messages({
    "any.required": "Login payload is required",
    "object.unknown": "Invalid login payload",
  });

  export const otpSchema = joi.object({
    email: generalFields.email,
    otp: generalFields.otp
  }).required().messages({
       "any.required": "otp payload is required",
    "object.unknown": "Invalid otp payload",
  })


  export const signinWithGoogleSchema = joi.object({
    idToken: generalFields.idToken
  }).required().messages({
       "any.required": "idToken payload is required",
    "object.unknown": "Invalid idToken payload",
  })