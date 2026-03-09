import joi from "joi";
import { SYS_GENDER, SYS_ROLE } from "../../common/index.js";
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
