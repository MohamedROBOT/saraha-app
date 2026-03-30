import { createClient } from "redis";
import appConfig from "../../config/config.service.js";
export const redisClient = createClient({
  url: appConfig.redisHost,
});

export const redisConnect = async () => {
  try {
    await redisClient.connect();
    console.log("Connected to redis");
  } catch (error) {
    console.log("Error connecting to redis", error);
  }
};
