import { BadRequestException, SYS_GENDER, SYS_ROLE } from "../common/index.js";
import joi from "joi"
export const isValid = (schema) => {
  return (req, res, next) => {
 

    const validationResult = schema.validate(req.body, {
      abortEarly: false, //bad as a performance but good for UX
    });
    if (validationResult.error) {
      let errorMessages = validationResult.error.details.map((error) => {
        return {
          message: error.message,
          field: error.path[0],
        };
      });
      throw new BadRequestException("validationn error", errorMessages);
    }
    next();
  };
};

//can be put here or in common folder
export const generalFields = {
    userName: joi.string().required().min(2).max(20).trim().messages({
          "string.base": "username must be a string",
          "string.empty": "username is required",
          "string.min": "username must be at least 2 characters long",
          "string.max": "username must be at most 20 characters long",
        }),
    email: joi
          .string()
          .pattern(/^\w{1,100}@(gmail|yahoo|icloud)(.edu|.com|.eg|.net){1,3}$/) //look at docs before send the assignment
          .when("phoneNumber", {
            is: joi.exist(),
            then: joi.optional(),
            otherwise: joi.required(),
          })
          .messages({
            "string.pattern.base": "email must be in the format john@domain.com",
            "string.empty": "email is required",
          }),
    password:  joi
          .string()
          .required()
          .pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          )
          .messages({
            "string.pattern.base":
              "password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
          }),
    rePassword: joi.string().valid(joi.ref("password")).required().messages({
      "any.only": "passwords do not match",
      "any.required": "rePassword is required",
    }),
    gender: joi
          .number()
          .valid(...Object.values(SYS_GENDER))
          .default(0),
    role: joi
      .number()
      .valid(...Object.values(SYS_ROLE))
      .default(0),
    phoneNumber: joi
          .string()
          .pattern(/^(00201|01|\+201)[0125]{1}[0-9]{8}$/)
          .messages({
            "string.pattern.base":
              "phone number must be in the format 00201012345678 or 01012345678 or +201012345678",
          }),
            otp: joi.string().required().min(2).max(20).trim().messages({
          "string.base": "otp must be a string",
          "string.empty": "otp is required",
          "string.min": "otp must be at least 2 characters long",
          "string.max": "otp must be at most 20 characters long",
        }),
        idToken: joi.string().required().messages({
          "string.base": "idToken must be a string",
          "string.empty": "idToken is required",
        }),
}