import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  content: String,
  book: String,
  author: String,
  publisher: String,
  publishedDate: String,
  bookCover: String,
  keyword: [String],
  genre: [String],
  music: String,
  artist: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const History = mongoose.model("History", historySchema);
export default History;
