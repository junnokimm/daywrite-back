import mongoose from "mongoose";

const scriptSchema = new mongoose.Schema({
  content: { type: String, required: true },
  book: { type: String, required: true },
  author: { type: String, required: true },
  publisher: { type: String },
  publishedDate: { type: String },
  bookCover: { type: String }, // 이미지 URL
  keyword: [{ type: String }],
  genre: [{ type: String }],
});

export default mongoose.model("Script", scriptSchema);
