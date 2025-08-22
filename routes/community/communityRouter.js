import express from "express";
import CommunityPost from "../../models/communityPostSchema.js";
import mongoose from "mongoose";

const router = express.Router();

// 생성
router.post("/posts", async (req, res) => {
  try {
    const post = await CommunityPost.create(req.body);
    res.status(201).json(post);
  } catch (e) {
    res.status(500).json({ message: "create failed", error: e.message });
  }
});

// 공개 + 저장(게시) 목록
router.get("/posts/public", async (req, res) => {
  const { sort = "popular" } = req.query;
  const sortObj = sort === "recent" ? { createdAt: -1 } : { likes: -1, createdAt: -1 };
  const items = await CommunityPost.find({ isPublic: true, status: "published" }).sort(sortObj).lean();
  res.json({ items, total: items.length });
});

// 내 글 목록
router.get("/posts/mine", async (req, res) => {
  const { userId, status = "published" } = req.query;
  if (!userId) return res.status(400).json({ message: "userId required" });
  const items = await CommunityPost.find({ userId, status }).sort({ createdAt: -1 }).lean();
  res.json({ items, total: items.length });
});

// ✨ 수정
router.put("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    // 업데이트 가능한 필드만 선택적으로 허용 (보안/정합성)
    const allowed = [
      "title",
      "refAuthor",
      "content",
      "musicTitle",
      "musicArtist",
      "isPublic",
      "status",      // 'draft' | 'published'
      "type",        // 'original' | 'reference' (변경 허용 시)
    ];
    const $set = {};
    for (const k of allowed) {
      if (k in req.body) $set[k] = req.body[k];
    }

    const updated = await CommunityPost.findByIdAndUpdate(
      id,
      { $set },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    return res.status(200).json({ success: true, item: updated });
  } catch (err) {
    console.error("[community update]", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// 삭제
router.delete("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId || req.body?.userId;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const match = userId ? { _id: id, userId } : { _id: id };
    const result = await CommunityPost.deleteOne(match);

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, deletedCount: 0 });
    }
    return res.status(200).json({ success: true, deletedCount: 1 });
  } catch (err) {
    console.error("[community delete] ", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;