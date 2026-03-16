import express from "express";
import { connectDB } from "./DB/connection.js";
import { authRouter, userRouter } from "./modules/index.js";
import appConfig from "../config/config.service.js";

const bootstrap = async () => {
  const app = express();
  const port = appConfig.port;
  connectDB();
  //parsing data from request body (raw)
  app.use(express.json());
  //access to files & folders
  app.use("/uploads", express.static("uploads"));
  app.use("/auth", authRouter);
  app.use("/user", userRouter);

  //global error handler
  app.use((error, req, res, next) => {
    //this is to control jwt default messages
    if (error.message === "jwt expired") error.message = "Token expired";
    const errors = { message: error.message, success: false };
    if (error.details?.length !== 0) errors.details = error.details;
    return res.status(error.cause || 500).json(errors);
  });
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

export default bootstrap;
