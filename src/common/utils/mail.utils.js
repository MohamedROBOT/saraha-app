import nodemailer from "nodemailer";
import appConfig from "../../../config/config.service.js";
export const sendMail = ({to,subject,html}={}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: appConfig.email,
      pass: appConfig.password,
    },
  });

  transporter.sendMail({
    from: `"Velora-Sro"<${appConfig.email}>`,
    to,
    subject,
    html
  })
};
