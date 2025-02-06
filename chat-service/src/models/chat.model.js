import mongoose,{Schema} from "mongoose";

const chatSchema = new Schema({
    senderId:{
        type:String,
        required:true,
    },
    roomId:{
        type:String,
        required:true,
    },
    message:{
        type:String,
        required:true,
    },
},
{
    timestamps:true
});

export const Chat = mongoose.model("Chat",chatSchema);