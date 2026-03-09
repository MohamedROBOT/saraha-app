import nodemailer from "nodemailer";
import appConfig from "../../../config/config.service.js";
import { SYS_MAIL } from "../constant/mailTemplate.constant.js";

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: appConfig.email,
    pass: appConfig.password,
  },
});

export const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: appConfig.email,
    to: email,
    subject: "OTP Verification",
    html: SYS_MAIL(otp),
  });
};
