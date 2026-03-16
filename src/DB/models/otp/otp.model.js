import { model, Schema } from "mongoose";
const schema = new Schema(
  {
    //we use email if we create otp seperate model
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: true,
    },
    //ttl => time to live
    expiresAt: {
      type: Date, //when this time comes otp will be deleted from DB automatically
      index: { expires: 0 },
    },
    attempts: {
      type: Number,
      default: 0,
    }
  },
  {
    versionKey: false,
  },
);
export const OTP = model("otp", schema);
