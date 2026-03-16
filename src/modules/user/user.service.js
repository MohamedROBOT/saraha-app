import { userRepository } from "../../DB/index.js";
import fs from "node:fs";
export const checkUserExist = async (filter) => {
  return await userRepository.getOne(filter); //{} or null
};

export const createUser = async (userData) => {
  return await userRepository.create(userData);
};

export const getProfile = async (filter) => {
  return await userRepository.getOne(filter); //{} | null
};

export const updateUser = async (filter, update) => {
  return await userRepository.update(filter, update); //{} | null
};

export const uploadProfilePic = async(user, file) => {
  //upload into DB
 const updatedUser =  await userRepository.update({ _id: user._id }, { profilePic: file.path });
  if(fs.existsSync(user.profilePic)) fs.unlinkSync(user.profilePic)
   return updatedUser
};
