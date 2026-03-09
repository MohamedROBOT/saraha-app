import pkg from "bcryptjs";
export const hash = async (password) => {
 return await pkg.hash(password, 12);
};

export const compare =async (password, hashedPassword) => {
   return await pkg.compare(password, hashedPassword)
};

