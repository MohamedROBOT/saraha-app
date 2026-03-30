import crypto from "node:crypto";
import appConfig from "../../../config/config.service.js";
export const encryption = (plainText) => {
  //8 byte >> 16 * 8 =>> secret key >> 32
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(appConfig.encryptionKey), //32
    //IV for Iteration Vector
    iv,
  );
  let encryptedData = cipher.update(plainText, "utf-8", "hex");
  encryptedData += cipher.final("hex");
  return `${iv.toString("hex")}:${encryptedData}`;
};

export const decryption = (encryptedData) => {
  const [iv, encryptedValue] = encryptedData.split(":");
  const ivBufferLike = Buffer.from(iv, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(appConfig.encryptionKey),
    ivBufferLike,
  );

  let decryptedValue = decipher.update(encryptedValue, "hex", "utf-8");
  decryptedValue += decipher.final("utf-8");
  return decryptedValue;
};

