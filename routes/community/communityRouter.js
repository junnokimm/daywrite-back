import express from "express";
import CommunityPost from "../../models/communityPostSchema.js";
import mongoose from "mongoose";

const router = express.Router();

// 생성 (임시저장/저장 공통)
router.post("/posts", async (req, res) => {
  try {
    const post = await CommunityPost.create(req.body);
    res.status(201).json(post);
  } catch (e) {
    res.status(500).json({ message: "create failed", error: e.message });
  }
});

// 공개 + 저장(게시) 목록
// GET /community/posts/public?sort=popular|recent
router.get("/posts/public", async (req, res) => {
  const { sort = "popular" } = req.query;
  const sortObj = sort === "recent" ? { createdAt: -1 } : { likes: -1, createdAt: -1 };
  const items = await CommunityPost.find({ isPublic: true, status: "published" }).sort(sortObj).lean();
  res.json({ items, total: items.length });
});

// 내 글 목록
// GET /community/posts/mine?userId=...&status=published|draft
router.get("/posts/mine", async (req, res) => {
  const { userId, status = "published" } = req.query;
  if (!userId) return res.status(400).json({ message: "userId required" });
  const items = await CommunityPost.find({ userId, status }).sort({ createdAt: -1 }).lean();
  res.json({ items, total: items.length });
});

// 삭제
router.delete("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId || req.body?.userId;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    // 소유자 확인을 하고 싶다면 아래 조건 사용:
    const match = userId ? { _id: id, userId } : { _id: id };

    const result = await CommunityPost.deleteOne(match);

    if (result.deletedCount === 0) {
      // 소유권 불일치 또는 존재하지 않는 문서
      return res.status(404).json({ success: false, deletedCount: 0 });
    }
    return res.status(200).json({ success: true, deletedCount: 1 });
    // 또는 204 사용:
    // return res.status(204).send();
  } catch (err) {
    console.error("[community delete] ", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
