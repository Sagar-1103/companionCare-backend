import mongoose,{Schema} from "mongoose";

const AIChatSchema = new Schema({
    userId:{
        type:String,
        required:true,
    },
    query:{
        type:String,
        required:true,
    },
    reply:{
        type:String,
        required:true,
    }
},
{timestamps:true}
)

export const AIChat = mongoose.model("AIChat",AIChatSchema)