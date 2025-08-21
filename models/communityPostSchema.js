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

    isPublic: { type: Boolean, default: true }, // 커뮤니티 공개 여부
    status: { type: String, enum: ["draft", "published"], default: "draft" }, // 임시저장/저장

    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("CommunityPost", CommunityPostSchema);