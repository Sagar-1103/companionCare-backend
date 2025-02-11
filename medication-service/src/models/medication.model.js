import mongoose, { Schema } from "mongoose";

const medicationSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    medicineName: {
      type: String,
      required: true,
    },
    medicineType: {
      type: String,
      required: true,
    },
    medicineDosage: {
      type: String,
      required: true,
    },
    timing: {
      type: Date,
      required: true,
    },
    medText: {
      type: String,
    },
    startDate:{
      type:String,
      required:true,
    },
    endDate:{
      type:String,
      required:true,
    },
    before:{
      type:Number,
    },
    after:{
      type:Number,
    }
  },
  {
    timestamps: true,
  }
);

export const Medication = mongoose.model("Medication", medicationSchema);
