import mongoose from "mongoose";

const scriptSchema = new mongoose.Schema({
  content: { type: String, required: true },
  book: { type: String, required: true },
  author: { type: String, required: true },
  publisher: { type: String },
  publishedDate: { type: String },
  bookCover: { type: String }, 
  keyword: [{ type: String }],
  genre: [{ type: String }],
},{
  collection: 'scripts'   // 우리 DB의 scripts 컬렉션으로부터 글을 불러옴
});

export default mongoose.model("Script", scriptSchema);


