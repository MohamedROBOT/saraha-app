import { Router } from "express";

import { decryption, fileUpload } from "../../common/index.js";

import { isAuthenticated } from "../../middlewares/authentication.middleware.js";
import { fileValidation } from "../../middlewares/file-validation.middleware.js";
import { uploadProfilePic } from "./user.service.js";
const router = Router();
router.get("/", isAuthenticated, async (req, res, next) => {
  //we used middleware to verify token
  //decryption phone
  const { user } = req;
  user.phoneNumber && (user.phoneNumber = decryption(user.phoneNumber));
  return res.status(200).json({
    message: "profile fetched successfully",
    success: true,
    data: {
      user,
    },
  });
});

router.patch(
  "/upload-profile-picture",
  isAuthenticated,
  fileUpload().single("pp"),
  fileValidation,
  async (req, res, net) => {
   const updatedUser = await uploadProfilePic(req.user, req.file);
    return res.json({
      message: "profile picture uploaded successfully",
      data: { updatedUser },
      success: true,
    })
  },
);
export default router;
