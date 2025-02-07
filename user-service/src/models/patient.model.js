import mongoose, { Schema } from "mongoose";

const patientSchema = new Schema(
  {
    patientId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    caretakerId: {
      type: mongoose.Types.ObjectId,
      ref: "Caretaker",
    },
    doctorId: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
    },
    analyticsId: {
      type: mongoose.Types.ObjectId,
      ref: "Analytic",
    },
    name: {
      type: String,
      required: true,
    },
    dob: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Others"],
      required: true,
    },
    code:{
      type:String,
      required:true,
    }
  },
  {
    timestamps: true,
  }
);

export const Patient = mongoose.model("Patient", patientSchema);
