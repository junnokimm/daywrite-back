import History from '../historySchema.js';
import mongoose from 'mongoose';

const BookmarkFolderSchema = new mongoose.Schema({
  ownerId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  type: { type: String, enum: ["글", "곡"], required: true },
  historyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'History' }],
  thumbnailUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  imageUpload: { type: mongoose.Schema.Types.ObjectId, ref: "ImageUpload"}
},{ timestamps: true });

BookmarkFolderSchema.index({ ownerId: 1, createdAt: -1 });
const BookmarkFolder = mongoose.model('BookmarkFolder', BookmarkFolderSchema);
export default BookmarkFolder;