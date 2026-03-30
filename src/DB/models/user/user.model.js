import { model, Schema } from "mongoose";
import { SYS_GENDER, SYS_PROVIDER, SYS_ROLE } from "../../../common/index.js";
const schema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 20,
      uppercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    provider: {
      type: String,
      enum: Object.values(SYS_PROVIDER),
      default: SYS_PROVIDER.system,
    },
    password: {
      type: String,
      required: function () {
        if (this.provider !== SYS_PROVIDER.system) return false;
        return true;
      },
    },
    gender: {
      type: Number,
      //return array of values of keys
      enum: {
        values: Object.values(SYS_GENDER),
        message:
          "invalid gender value must be 0-2, 0 for male, 1 for female, 2 for other",
      },
      required: true,
      default: SYS_GENDER.male,
    },
    role: {
      type: Number,
      enum: Object.values(SYS_ROLE),
      default: SYS_ROLE.user,
    },
    phoneNumber: {
      type: String,
      required: function () {
        if (this.email) return false;
        return true;
      },
    },

    // otp: { related to otp old layer
    //   type: String,
    //   required: false,
    // },
    // otpExpireAt: {
    //   type: Date,
    //   required: false,
    // },
    isVerified: {
      type: Boolean,
      default: true,
    },
    credentialsUpdatedAt: {
      type: Date,
      default: Date.now(),
    },
  },

  {
    timestamps: true,
    strict: true, //strict data
    versionKey: false,
  },
);
export const User = model("User", schema);
