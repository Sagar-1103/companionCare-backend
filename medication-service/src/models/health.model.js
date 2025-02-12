import mongoose, { Schema } from "mongoose";

const healthSchema = new Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    heartRate: {
      type: Number,
      required: true,
    },
    bloodPressure: {
      systolic: { type: Number, required: true },
      diastolic: { type: Number, required: true },
    },
    bodyTemperature: {
      type: Number,
      required: true,
    },
    bloodSugar: {
      type: Number,
      required: true,
    },
    spo2: {
      type: Number,
      required: true,
    },
    sleep: {
      type: Number,
      required: true,
    },
    steps: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Health = mongoose.model("Health", healthSchema);

//heartrate,bloodpressure,bodytemp,bloodsugar,spo2,sleep,steps,
