import multer, { diskStorage } from "multer";
import fs from "node:fs";
import { BadRequestException } from "./error.utils.js";
export const fileUpload = (allowedType = ["image/jpeg", "image/png"]) => {
  return multer({
    //filter but not trusted
    fileFilter: (req, file, cb) => {
      //condition to filter file and call cb and return error and false
    
      if (!allowedType.includes(file.mimetype))
        return cb(new BadRequestException("invalid file type"), false);

      cb(null, true);
    },
    limits:{fileSize: 50000000000},
    storage: diskStorage({
      //result from execution of [diskStorage, memoryStorage]
      
      destination: (req, file, cb) => {
        //create folder
        //string => path to save file or function
        const folder = req.user? `uploads/${req.user._id}` : `uploads/${req.params.receiverId}/messages`;
        if (!fs.existsSync(folder))
          fs.mkdirSync(folder, {recursive: true});
        cb(null, folder);
      },
      filename: (req, file, cb) => {
        //function
        cb(null, Math.random() + Date.now() + "__" + file.originalname); //create unique name
      },
    }),
  });
};
