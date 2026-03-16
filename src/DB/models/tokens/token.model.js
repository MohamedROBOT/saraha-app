import { model, Schema } from "mongoose";

const schema = new Schema({
    token: String,
    userId: {type: Schema.Types.ObjectId, ref:"User",required:true},
    expiresAt: {
        type: Date,
        index: {expires:0} //time to live
    }
})


 const Token = model("Token", schema)

 export default Token