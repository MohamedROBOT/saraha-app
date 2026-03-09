import appConfig from "../../config/config.service.js";
import { NotFoundException, SYS_MESSAGE, verifyToken } from "../common/index.js";
import { userRepository } from "../DB/index.js";

export const isAuthenticated = async (req, res, next) => {
  //get token from request
  const { authorization } = req.headers;
  //decode token verify which is different from decode function
  const payload = verifyToken(authorization, appConfig.jwtAccessSecret);
  //get profile service
  const user = await userRepository.getOne({_id: payload.sub})
  req.user = user;
  if (!user) throw new NotFoundException(SYS_MESSAGE.user.notFound);
  next();
};
