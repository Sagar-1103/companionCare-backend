import mongoose, { Schema } from "mongoose";

const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
  },
  coordinates: [Number],
});

const geoSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    fallDetectionStatus: {
      type: Boolean,
      default: false,
    },
    radius:{
      type:Number,
      default:80
    },
    patientLocation:locationSchema,
    homeLocation: locationSchema,
  },
  {
    timestamps: true,
  }
);

geoSchema.index({ patientLocation: "2dsphere" });
geoSchema.index({ homeLocation: "2dsphere" });

export const Geo = mongoose.model("Geo", geoSchema);
