import mongoose, { Schema } from "mongoose";

const doctorSchema = new Schema(
  {
    doctorId:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    patientId:{
        type:mongoose.Types.ObjectId,
        ref:"Patient"
    }
  },
  {
    timestamps: true,
  }
);

export const Doctor = mongoose.model("Doctor", doctorSchema);
