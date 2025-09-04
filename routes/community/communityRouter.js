import express from "express";
import CommunityPost from "../../models/communityPostSchema.js";
import mongoose from "mongoose";
import Like from "../../models/community/likeSchema.js";

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
  const { sort = "popular", userId } = req.query;
  const sortObj = sort === "recent" ? { createdAt: -1 } : { likes: -1, createdAt: -1 };

  const items = await CommunityPost.find({ isPublic: true, status: "published" }).sort(sortObj).lean();

  const uid = userId ? String(userId) : null;

  const mapped = items.map((it) => ({
    ...it,
    likes: it.likes ?? (it.likedBy?.length || 0),
    liked: uid ? (it.likedBy || []).some((v) => String(v) === uid) : false,
  }));

  res.json({ items: mapped, total: mapped.length });
});

// 내 글 목록
router.get("/posts/mine", async (req, res) => {
  const { userId, status = "published" } = req.query;
  if (!userId) return res.status(400).json({ message: "userId required" });

  const items = await CommunityPost.find({ userId, status }).sort({ createdAt: -1 }).lean();

  const uid = String(userId);
  const mapped = items.map((it) => ({
    ...it,
    likes: it.likes ?? (it.likedBy?.length || 0),
    liked: (it.likedBy || []).some((v) => String(v) === uid),
  }));

  res.json({ items: mapped, total: mapped.length });
});

/* ---------------------------
   ✅ 정적 라우트 먼저: /posts/liked
---------------------------- */
router.get("/posts/liked", async (req, res) => {
  try {
    const { userId, q = "" } = req.query;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: "userId required/invalid" });
    }

    const uid = new mongoose.Types.ObjectId(userId);

    const likes = await Like.find({ user: uid, targetType: "community" }).lean();
    const postIds = likes.map((l) => l.targetId);
    if (postIds.length === 0) return res.json({ items: [] });

    const cond = { _id: { $in: postIds } };
    if (q) {
      const re = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      cond.$or = [{ title: re }, { content: re }, { nickname: re }, { musicTitle: re }, { musicArtist: re }];
    }

    const posts = await CommunityPost.find(cond).sort({ createdAt: -1 }).lean();

    const items = posts.map((p) => ({
      ...p,
      likes: p.likes ?? (p.likedBy?.length || 0),
      liked: true,
    }));

    return res.json({ items });
  } catch (e) {
    console.error("[community liked]", e);
    return res.status(500).json({ success: false, message: "failed to load liked list" });
  }
});

/* ---------------------------
   ✅ 그 다음에 :id 라우트들 (정규식 제거)
---------------------------- */

// 좋아요 토글
router.post("/posts/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const post = await CommunityPost.findById(id);
    if (!post) return res.status(404).json({ success: false, message: "Not found" });

    const uid = new mongoose.Types.ObjectId(userId);
    const already = (post.likedBy || []).some((v) => v.equals(uid));

    if (already) {
      post.likedBy = (post.likedBy || []).filter((v) => !v.equals(uid));
      await Like.deleteOne({ user: uid, targetId: post._id, targetType: "community" });
    } else {
      (post.likedBy ||= []).push(uid);
      await Like.updateOne(
        { user: uid, targetId: post._id, targetType: "community" },
        { $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      );
    }

    post.likes = post.likedBy.length;
    await post.save();

    return res.status(200).json({
      success: true,
      liked: !already,
      likes: post.likes,
      postId: post._id,
    });
  } catch (err) {
    console.error("[community like]", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// 단건 조회
router.get("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const doc = await CommunityPost.findById(id).lean();
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });

    const uid = userId ? String(userId) : null;
    const liked = uid ? (doc.likedBy || []).some((v) => String(v) === uid) : false;
    const likes = doc.likes ?? (doc.likedBy?.length || 0);

    return res.status(200).json({ item: { ...doc, liked, likes } });
  } catch (err) {
    console.error("[community get by id]", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// 수정
router.put("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const allowed = ["title", "refAuthor", "content", "musicTitle", "musicArtist", "isPublic", "status", "type"];
    const $set = {};
    for (const k of allowed) if (k in req.body) $set[k] = req.body[k];

    const updated = await CommunityPost.findByIdAndUpdate(id, { $set }, { new: true, runValidators: true }).lean();

    if (!updated) return res.status(404).json({ success: false, message: "Not found" });
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

    try {
      await Like.deleteMany({ targetId: id, targetType: "community" });
    } catch {}

    return res.status(200).json({ success: true, deletedCount: 1 });
  } catch (err) {
    console.error("[community delete] ", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
