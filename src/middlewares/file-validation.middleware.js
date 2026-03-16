import { fileTypeFromBuffer } from "file-type";
import fs from "node:fs";
import { BadRequestException } from "../common/index.js";



export const fileValidation = async (req,res, next)=>{
    const filePath = req.file.path;

    const buffer = fs.readFileSync(filePath);

    const type = await fileTypeFromBuffer(buffer);
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if(!type || !allowedTypes.includes(type.mime))
    {
        //delete uploaded file
        fs.unlinkSync(filePath)
        throw new BadRequestException("invalid file type")

    }

    next();

}