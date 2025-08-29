import { Schema, model, Types } from "mongoose";

const likeSchema = new Schema({
  user:       { type: Types.ObjectId, ref: "User", required: true, index: true },
  targetId:   { type: Types.ObjectId, required: true, index: true },
  targetType: { type: String, enum: ["typed", "played"], required: true, index: true },
  createdAt:  { type: Date, default: Date.now }
}, { versionKey: false });

likeSchema.index({ user: 1, targetId: 1, targetType: 1 }, { unique: true }); // 같은 유저가 같은 대상에 2번 못 누름

export default model("Like", likeSchema, "likes");