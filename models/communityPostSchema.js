import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    nickname: { type: String, required: true },
    profileImg: { type: String, default: "" },

    type: { type: String, enum: ["original", "reference"], required: true },
    title: { type: String, required: true },
    refAuthor: { type: String, default: "" },

    content: { type: String, default: "" },
    musicTitle: { type: String, default: "" },
    musicArtist: { type: String, default: "" },

    isPublic: { type: Boolean, default: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },

    // 좋아요
    likes: { type: Number, default: 0 },
    likedBy: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },

    // 전체 댓글 수(대댓글 포함)
    comments: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 인기 정렬 자주 사용
postSchema.index({ isPublic: 1, status: 1, likes: -1, createdAt: -1 });

// 안전장치: 저장 전 likes 동기화
postSchema.pre("save", function (next) {
  if (!Array.isArray(this.likedBy)) this.likedBy = [];
  this.likes = this.likedBy.length;
  next();
});

// 모델명은 그대로 유지(컬렉션/기존 코드 호환)
export default mongoose.models.CommunityPost || mongoose.model("CommunityPost", postSchema);
