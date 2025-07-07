import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  scriptId: { type: mongoose.Schema.Types.ObjectId, ref: "Script", required: true },
  savedContent: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  bookmarked: { type: Boolean, default: false },
  // musicId: { type: mongoose.Schema.Types.ObjectId, ref: "Music" },
});

export default mongoose.model("History", historySchema);
