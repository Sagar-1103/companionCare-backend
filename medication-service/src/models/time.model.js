import mongoose, { Schema } from "mongoose";

const timeSchema = new Schema(
  {
    patientId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    timings: {
      breakfast: {
        type: String,
      },
      lunch: {
        type: String,
      },
      dinner: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Time = mongoose.model("Time", timeSchema);
