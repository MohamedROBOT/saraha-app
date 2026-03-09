import { userRepository } from "../../DB/index.js";

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