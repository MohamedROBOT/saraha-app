import { Router } from "express";
import { getAllMessages, getSpecificMessage, sendMessage } from "./message.service.js";
import { fileUpload, SYS_MESSAGE } from "../../common/index.js";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";

const router = Router();
//send message
router.post(
  "/:receiverId/anonymous",
  fileUpload().array("attachments", 2),
  async (req, res, next) => {
    const { content } = req.body;
    const { receiverId } = req.params;
    const files = req.files;
    const createdMessage = await sendMessage(content, files, receiverId);
    return res.status(201).json({
      message: SYS_MESSAGE.message.created,
      success: true,
      data: {
        createdMessage,
      },
    });
  },
);

router.post(
  "/:receiverId/public",
  isAuthenticated,
  fileUpload().array("attachments", 2),
  async (req, res, next) => {
    const { content } = req.body;
    const { receiverId } = req.params;
    const files = req.files;
    const createdMessage = await sendMessage(
      content,
      files,
      receiverId,
      req.user._id,
    );
    return res.status(201).json({
      message: SYS_MESSAGE.message.created,
      success: true,
      data: {
        createdMessage,
      },
    });
  },
);
//get all messages

//get specific message
router.get("/:messageId",isAuthenticated ,async (req, res, next) => {
  const { messageId } = req.params;
  const message = await getSpecificMessage(messageId, req.user._id);
  res.status(200).json({
    message: SYS_MESSAGE.message.fetched,
    success: true,
    data: {
      message,
    },
  })
});

router.get("/",isAuthenticated ,async (req, res, next) => {
  const messages = await getAllMessages(req.user._id);
  res.status(200).json({
    message: SYS_MESSAGE.message.fetched,
    success: true,
    data: {
      messages,
    },
  })
});
export default router;
