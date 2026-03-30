import appConfig from "../../config/config.service.js";
import {
  BadRequestException,
  NotFoundException,
  SYS_MESSAGE,
  verifyToken,
} from "../common/index.js";
import { userRepository } from "../DB/index.js";
import { redisClient } from "../DB/redis.connection.js";

export const isAuthenticated = async (req, res, next) => {
  //get token from request
  const { authorization } = req.headers;
  //decode token verify which is different from decode function
  const payload = verifyToken(authorization, appConfig.jwtAccessSecret);
  //get profile service
  const user = await userRepository.getOne({ _id: payload.sub });
  if (!user) throw new NotFoundException(SYS_MESSAGE.user.notFound);
  //check token invalidation through logoutAllDevices
  if (new Date(user.credentialsUpdatedAt).getTime() > payload.iat * 1000) {
    throw new BadRequestException("invalid token, please login again");
  }
  //check revoked tokens
  const tokenExist = await redisClient.get(`bl${payload.jti}`);
  if (tokenExist) throw new BadRequestException("invalid token, please login again");
  req.user = user;
  req.payload = payload;
  next();
};
