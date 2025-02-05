import mongoose, { Schema } from "mongoose";

const caretakerSchema = new Schema(
  {
    caretakerId:{
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

export const Caretaker = mongoose.model("Caretaker", caretakerSchema);
