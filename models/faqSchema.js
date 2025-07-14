import { Schema, model } from "mongoose";

const faqSchema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
}, {
  timestamps: true,
  versionKey: false
});

export default model('Faq', faqSchema, 'faq'); 
