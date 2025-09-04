import mongoose from "mongoose";
const { Schema } = mongoose;

const CommentSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: "CommunityPost", index: true, required: true }, // ← 모델명 맞춤
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },

    // 좋아요
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],

    // 대댓글
    parent: { type: Schema.Types.ObjectId, ref: "Comment", default: null, index: true },
    replies: { type: Number, default: 0 }, // 자식 수(대댓글 수)
  },
  { timestamps: true }
);

CommentSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.likedBy;
  },
});

export default mongoose.models.Comment || mongoose.model("Comment", CommentSchema);