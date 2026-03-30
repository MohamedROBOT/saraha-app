import { Router } from "express";
import { SYS_MESSAGE, fileUpload } from "../../common/index.js";
import {
  otpSchema,
  signinSchema,
  signinWithGoogleSchema,
  signupSchema,
} from "./auth.validation.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import {
  login,
  loginWithGoogle,
  logout,
  logoutFromAllDevices,
  refreshToken,
  sendOTP,
  signup,
  verifyAccount,
} from "./auth.service.js";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";

const router = Router();
//url kebab case
router.post(
  "/signup",
  fileUpload().none(), //parsing data from body from html form data, enforce you to have no file
  isValid(signupSchema),
  async (req, res, next) => {
    const createdUser = await signup(req);

    return res.status(201).json({
      message: SYS_MESSAGE.user.created,
      success: true,
      data: {
        // createdUser,
        message: "otp is send to mail",
      },
    });
  },
);
router.post("/signin", isValid(signinSchema), async (req, res, next) => {
  //apply validation first of everything

  const tokens = await login(req);

  //send response
  return res.status(200).json({
    message: "login successfully",
    success: true,
    tokens,
  });
});
router.patch("/verify-account", isValid(otpSchema), async (req, res, next) => {
  await verifyAccount(req);
  return res.status(200).json({
    message: "Email verified successfully",
    success: true,
  });
});

router.post("/send-otp", async (req, res, next) => {
  //check user exist and status before send it (BUG from instructor)
  //add it to service not here!
  await sendOTP(req);
  return res.status(200).json({
    message: "OTP sent successfully",
    success: true,
  });
});

router.get("/refresh-token", async (req, res, next) => {
  const tokens = await refreshToken(req);
  return res.status(200).json({
    message: "refresh token successfully",
    success: true,
    tokens: tokens,
  });
});

router.patch(
  "/logout-from-all-devices",
  isAuthenticated,
  async (req, res, next) => {
    await logoutFromAllDevices(req.user);
    return res.status(200).json({
      message: "logout from all devices successfully",
      success: true,
    });
  },
);

router.post("/logout", isAuthenticated, async (req, res, next) => {
  await logout(req.payload);
  return res.status(200).json({
    message: "logout successfully",
    success: true,
  });
});

router.post(
  "/login-with-google",
  isValid(signinWithGoogleSchema),
  async (req, res, next) => {
    const { idToken } = req.body;
    const { accessToken, refreshToken } = await loginWithGoogle(idToken);
    return res.status(200).json({
      success: true,
      message: "login with google successfully",
      token: {
        accessToken,
        refreshToken,
      },
    });
  },
);
export default router;
