import { Router } from "express";

import { decryption } from "../../common/index.js";

import { isAuthenticated } from "../../middlewares/authentication.middleware.js";
const router = Router();
router.get("/", isAuthenticated, async (req, res, next) => {

  //we used middleware to verify token
  //decryption phone
  const {user} = req;
  user.phoneNumber && (user.phoneNumber = decryption(user.phoneNumber));
  return res.status(200).json({
    message: "profile fetched successfully",
    success: true,
    data: {
      user,
    },
  });
});

export default router;
