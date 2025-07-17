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

historySchema.pre("deleteOne", { document: true, query: false }, async function (next) {
  const historyId = this._id;
  await Bookmark.deleteMany({ historyId });
  next();
});

const History = mongoose.model("History", historySchema);
export default History;
