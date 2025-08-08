import Playlist from './playListSchema.js';
import mongoose from 'mongoose';

const BookmarkPlayedFolderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["곡"], default: "곡" }, // "곡"으로 고정
  playlistIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }],
  thumbnailUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  likeCount: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // user 정보
});

const BookmarkPlayedFolder = mongoose.model('BookmarkPlayedFolder', BookmarkPlayedFolderSchema);
export default BookmarkPlayedFolder;