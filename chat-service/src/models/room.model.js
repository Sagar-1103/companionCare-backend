import mongoose,{Schema} from "mongoose";

const roomSchema = new Schema({
    user1Id:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true,
    },
    user2Id:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true,
    },
},
{
    timestamps:true
});

export const Room = mongoose.model("Room",roomSchema);