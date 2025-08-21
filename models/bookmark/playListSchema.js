import { Schema, model, Types } from "mongoose";

// const playListSchema = new Schema({
//   title: String,
//   artist: String,
//   userId: { type: Types.ObjectId, ref: 'User', index: true, required: true },
//   likedAt: { type: Date, default: Date.now },
//   likeCount: { type: Number, default: 0 },
// }, { timestamps: true, versionKey: false });
const playListSchema = new Schema({
  title: { type: String, required: true, trim: true },
  artist: { type: String, required: true, trim: true },

  // ✅ 이미지/앨범 관련: 어떤 키로 오더라도 저장되게
  imageUrl: { type: String, default: null },
  img: { type: String, default: null },          // 프론트가 img로 보낼 때 대비
  albumArt: { type: String, default: null },     // 다른 명칭 대비
  albumTitle: { type: String, default: null },   // 필요하면

  userId: { type: Types.ObjectId, ref: 'User', index: true, required: true },
  likedAt: { type: Date, default: Date.now },
  likeCount: { type: Number, default: 0 },
}, { timestamps: true, versionKey: false });


export default model ("Playlist", playListSchema, "playlist");