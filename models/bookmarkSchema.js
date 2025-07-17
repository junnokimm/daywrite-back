import mongoose from "mongoose";
import "./historySchema.js";

const bookmarkSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  historyId: { type: mongoose.Schema.Types.ObjectId, ref: "History", required: true },
  folderId: { type: Number, default: 1 }, // 북마크한 모든 글
  createdAt: { type: Date, default: Date.now },
});

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
export default Bookmark;
