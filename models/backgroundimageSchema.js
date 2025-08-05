import { Schema, model } from "mongoose";

const backgroundImageSchema = new Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  originalname: { type: String },
  mimetype: { type: String },
  size: { type: Number },
  uploadedAt: { type: Date, default: Date.now },
});

export default model("BackgroundImage", backgroundImageSchema, "backgroundImage");