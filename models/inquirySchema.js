import { Schema, model } from "mongoose";

const inquirySchema = new Schema({
  type: { type: String, required: true },
  email: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true }
}, {
  timestamps: true,     // createdAt, updatedAt 자동 생성
  versionKey: false     // __v 제거
});

export default model('Inquiry', inquirySchema, 'inquiry');