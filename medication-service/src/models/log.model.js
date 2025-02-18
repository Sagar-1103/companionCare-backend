import mongoose,{Schema} from "mongoose";

const logSchema = new Schema ({
    patientId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    }
},
{
    timestamps:true,
})

export const Log = mongoose.model("Log",logSchema);