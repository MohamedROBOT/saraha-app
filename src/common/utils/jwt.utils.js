import jwt from 'jsonwebtoken';
import appConfig from '../../../config/config.service.js';

const  signToken = (payload, secret, options)=>{
return jwt.sign(payload, secret, options)
}


export const generateToken = (payload)=>{
     // 1- accessToken
  const accessToken = signToken(payload, appConfig.jwtAccessSecret, {
   expiresIn: "1h"
  })

  // 2- refreshToken with different signature
  const refreshToken = signToken(payload, appConfig.jwtRefreshSecret, {
   expiresIn: "1y"
  })
return {accessToken, refreshToken}
}




export const verifyToken= (authorization, secret)=>{
   const payload= jwt.verify(authorization, secret);
   return payload
}