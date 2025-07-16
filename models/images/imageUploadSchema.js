import { Schema, model } from "mongoose";

const imageUploadSchema = new Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  originalname: { type: String },
  mimetype: { type: String },
  size: { type: Number },
  uploadedAt: { type: Date, default: Date.now },
});

export default model("ImageUpload", imageUploadSchema, "imageUpload")