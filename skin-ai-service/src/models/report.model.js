import mongoose,{Schema} from "mongoose";

const reportSchema = new Schema({
    report:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    patientId:{
        type:String,
    },
    doctorId:{
        type:String,
    }
},{
    timestamps:true,
})

export const Report  = mongoose.model("Report",reportSchema);