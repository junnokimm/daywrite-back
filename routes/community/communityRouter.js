import express from "express";
import CommunityPost from "../../models/communityPostSchema.js";
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

export default router;
