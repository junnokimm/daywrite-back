import { Schema, model, Types } from "mongoose";

const playListSchema = new Schema({
  title: String,
  artist: String,
  userId: { type: Types.ObjectId, ref: 'User', index: true, required: true },
  likedAt: { type: Date, default: Date.now },
  likeCount: { type: Number, default: 0 },
}, { timestamps: true, versionKey: false });

export default model ("Playlist", playListSchema, "playlist");