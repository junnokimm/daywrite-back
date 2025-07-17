import { Schema, model } from "mongoose";

const noticeSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }
}, {
  timestamps: true,
  versionKey: false
});

export default model('Notice', noticeSchema, 'notice');