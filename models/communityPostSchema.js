import mongoose from "mongoose";

const CommunityPostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    nickname: { type: String, required: true },
    profileImg: { type: String, default: "" },

    type: { type: String, enum: ["original", "reference"], required: true },
    title: { type: String, required: true },
    refAuthor: { type: String, default: "" }, // 참조글일 때 책 저자

    content: { type: String, default: "" },
    musicTitle: { type: String, default: "" },
    musicArtist: { type: String, default: "" },

    isPublic: { type: Boolean, default: true },                  // 커뮤니티 공개 여부
    status: { type: String, enum: ["draft", "published"], default: "draft" }, // 임시저장/저장

    // 👍 좋아요
    likes: { type: Number, default: 0 },                         // 표시/정렬용
    likedBy: {                                                   // 중복 방지 소스
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],                                               // 반드시 기본값
    },

    comments: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 인기 정렬 자주 쓰면 효과 큰 인덱스
CommunityPostSchema.index({ isPublic: 1, status: 1, likes: -1, createdAt: -1 });

// 안전장치: 저장 전 항상 likes를 likedBy 길이로 맞춤
CommunityPostSchema.pre("save", function (next) {
  if (!Array.isArray(this.likedBy)) this.likedBy = [];
  this.likes = this.likedBy.length;
  next();
});

export default mongoose.model("CommunityPost", CommunityPostSchema);