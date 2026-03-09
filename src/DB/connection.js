import mongoose from "mongoose";
import appConfig from "../../config/config.service.js";

export function connectDB(){
    try {
        mongoose.connect(appConfig.db)
        console.log("Connected to DB")
    } catch (error) {
        console.log("Error connecting to DB", error)
    }
}

