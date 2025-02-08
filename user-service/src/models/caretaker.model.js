import mongoose, { Schema } from "mongoose";

const caretakerSchema = new Schema(
  {
    caretakerId:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    name:{
      type:String,
      required:true,
    },
    patientId:{
        type:mongoose.Types.ObjectId,
        ref:"Patient"
    },
    code:{
      type:String,
    },
    roomId:{
      type:mongoose.Types.ObjectId,
      ref:"Room"
    }
  },
  {
    timestamps: true,
  }
);

export const Caretaker = mongoose.model("Caretaker", caretakerSchema);
