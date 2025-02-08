import mongoose, { Schema } from "mongoose";

const doctorSchema = new Schema(
  {
    doctorId:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    patients:[
      {
        patientId: {
          type: mongoose.Types.ObjectId,
          ref: "Patient",
        },
        code: {
          type: String,
        },
      }
    ]
  },
  {
    timestamps: true,
  }
);

export const Doctor = mongoose.model("Doctor", doctorSchema);
