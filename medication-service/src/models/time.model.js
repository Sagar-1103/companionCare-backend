import mongoose, { Schema } from "mongoose";

const timeSchema = new Schema(
  {
    patientId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      unique:true,
    },
    timings: {
      breakfast: {
        type: Date,
        required:true,
      },
      lunch: {
        type: Date,
        required:true,
      },
      dinner: {
        type: Date,
        required:true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Time = mongoose.model("Time", timeSchema);
