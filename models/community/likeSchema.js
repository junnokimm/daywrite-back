import { Schema, model, Types } from "mongoose";

const likeSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, index: true },
    targetId: { type: Types.ObjectId, required: true, index: true },

    targetType: { type: String, enum: ["typed", "played", "community"], required: true, index: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

likeSchema.index({ user: 1, targetId: 1, targetType: 1 }, { unique: true });

export default model("Like", likeSchema, "likes");
