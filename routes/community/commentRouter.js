// routes/community/commentRouter.js
import express from "express";
import Comment from "../../models/community/commentSchema.js";
import CommunityPost from "../../models/communityPostSchema.js";
import authRequired from "../../middlewares/authRequired.js";
import mongoose from "mongoose";

/**
 * @typedef {import('express').Request & { userId?: string }} AuthedRequest
 */
const router = express.Router();

/**
 * 댓글 목록 (최상위)
 * GET /api/community/:postId/comments?cursor=<ISO>&limit=20&userId=<id>
 */
router.get("/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;
    const { cursor, limit = 20, userId } = req.query;

    const cond = { post: postId, parent: null };
    if (cursor) cond.createdAt = { $lt: new Date(cursor) };

    const list = await Comment.find(cond)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate("user", "nickname profileImageUrl");

    const items = list.map((c) => ({
      _id: c.id,
      post: c.post,
      content: c.content,
      likes: c.likes,
      replies: c.replies,
      parent: c.parent,
      createdAt: c.createdAt,
      user: {
        _id: c.user?._id,
        nickname: c.user?.nickname || "익명",
        profileImg: c.user?.profileImageUrl || "/assets/images/profiles/profile.jpg",
      },
      liked: userId ? c.likedBy?.some((uid) => String(uid) === String(userId)) : false,
    }));

    res.json({ ok: true, items, nextCursor: list.at(-1)?.createdAt ?? null });
  } catch (e) {
    console.error("[comments list]", e);
    res.status(500).json({ ok: false, message: "댓글 목록 조회 실패" });
  }
});

/**
 * 대댓글 목록
 * GET /api/community/comments/:commentId/replies?cursor=&limit=&userId=
 */
router.get("/comments/:commentId/replies", async (req, res) => {
  try {
    const { commentId } = req.params;
    const { cursor, limit = 20, userId } = req.query;

    const cond = { parent: commentId };
    if (cursor) cond.createdAt = { $lt: new Date(cursor) };

    const list = await Comment.find(cond)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate("user", "nickname profileImageUrl");

    const items = list.map((c) => ({
      _id: c.id,
      post: c.post,
      content: c.content,
      likes: c.likes,
      replies: c.replies,
      parent: c.parent,
      createdAt: c.createdAt,
      user: {
        _id: c.user?._id,
        nickname: c.user?.nickname || "익명",
        profileImg: c.user?.profileImageUrl || "/assets/images/profiles/profile.jpg",
      },
      liked: userId ? c.likedBy?.some((uid) => String(uid) === String(userId)) : false,
    }));

    res.json({ ok: true, items, nextCursor: list.at(-1)?.createdAt ?? null });
  } catch (e) {
    console.error("[replies list]", e);
    res.status(500).json({ ok: false, message: "대댓글 목록 조회 실패" });
  }
});

/** 댓글 생성(최상위) */
router.post("/:postId/comments", authRequired, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.userId; // ✅ 미들웨어가 세팅

    if (!content?.trim()) {
      return res.status(400).json({ ok: false, message: "내용이 비었습니다." });
    }

    const created = await Comment.create({ post: postId, user: userId, content });

    // 전체 댓글 수 +1
    await CommunityPost.findByIdAndUpdate(postId, { $inc: { comments: 1 } });

    const populated = await created.populate("user", "nickname profileImageUrl");

    res.json({
      ok: true,
      item: {
        _id: populated.id,
        post: populated.post,
        content: populated.content,
        likes: populated.likes,
        replies: populated.replies,
        parent: null,
        createdAt: populated.createdAt,
        user: {
          _id: populated.user?._id,
          nickname: populated.user?.nickname || "익명",
          profileImg: populated.user?.profileImageUrl || "/assets/images/profiles/profile.jpg",
        },
        liked: false,
      },
    });
  } catch (e) {
    console.error("[comment create]", e);
    res.status(500).json({ ok: false, message: "댓글 작성 실패" });
  }
});

/** 대댓글 생성 */
router.post("/comments/:commentId/replies", authRequired, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.userId; // ✅

    if (!content?.trim()) {
      return res.status(400).json({ ok: false, message: "내용이 비었습니다." });
    }

    const parent = await Comment.findById(commentId);
    if (!parent) return res.status(404).json({ ok: false, message: "부모 댓글이 없습니다." });

    const created = await Comment.create({
      post: parent.post,
      user: userId,
      content,
      parent: parent._id,
    });

    await Comment.findByIdAndUpdate(parent._id, { $inc: { replies: 1 } });
    await CommunityPost.findByIdAndUpdate(parent.post, { $inc: { comments: 1 } });

    const populated = await created.populate("user", "nickname profileImageUrl");

    res.json({
      ok: true,
      item: {
        _id: populated.id,
        post: populated.post,
        content: populated.content,
        likes: populated.likes,
        replies: populated.replies,
        parent: populated.parent,
        createdAt: populated.createdAt,
        user: {
          _id: populated.user?._id,
          nickname: populated.user?.nickname || "익명",
          profileImg: populated.user?.profileImageUrl || "/assets/images/profiles/profile.jpg",
        },
        liked: false,
      },
    });
  } catch (e) {
    console.error("[reply create]", e);
    res.status(500).json({ ok: false, message: "대댓글 작성 실패" });
  }
});

/** 댓글 좋아요 토글 (on/off) */
router.post("/comments/:commentId/like", authRequired, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId; // ✅ 통일

    const comment = await Comment.findById(commentId).select("_id likedBy");
    if (!comment) return res.status(404).json({ ok: false, message: "댓글이 없습니다." });

    const already = (comment.likedBy || []).some((id) => String(id) === String(userId));
    const modify = already ? { $pull: { likedBy: userId } } : { $addToSet: { likedBy: userId } };

    await Comment.updateOne({ _id: commentId }, modify);

    // likes = likedBy 길이로 재계산
    const refreshed = await Comment.findById(commentId).select("likedBy");
    const nextLikes = refreshed?.likedBy?.length ?? 0;
    await Comment.updateOne({ _id: commentId }, { $set: { likes: nextLikes } });

    return res.json({ ok: true, liked: !already, likes: nextLikes });
  } catch (e) {
    console.error("[comment like]", e);
    return res.status(500).json({ ok: false, message: "댓글 좋아요 실패" });
  }
});

/** 댓글 수정 (작성자만) */
router.patch("/comments/:commentId", authRequired, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ ok: false, message: "내용이 비었습니다." });
    }

    // ✅ 토큰에서 뽑은 userId → ObjectId로 안전 변환
    const rawUid = req.userId; // 미들웨어가 넣어준 값
    if (!mongoose.isValidObjectId(rawUid)) {
      return res.status(401).json({ ok: false, message: "토큰의 사용자 ID가 유효하지 않습니다." });
    }
    const uid = new mongoose.Types.ObjectId(rawUid);

    // ✅ 작성자만 수정 가능
    const comment = await Comment.findById(commentId).select("user");
    if (!comment) return res.status(404).json({ ok: false, message: "댓글이 없습니다." });

    const isOwner = comment.user?.equals?.(uid) === true;
    if (!isOwner) {
      // 디버깅이 필요하면 아래 주석을 잠깐 열어서 값 확인 가능
      // console.log("PATCH forbidden", { uid: String(uid), commentUser: String(comment.user) });
      return res.status(403).json({ ok: false, message: "본인만 수정 가능합니다." });
    }

    await Comment.updateOne({ _id: commentId }, { $set: { content } });
    return res.json({ ok: true });
  } catch (e) {
    console.error("[comment edit]", e);
    return res.status(500).json({ ok: false, message: "댓글 수정 실패" });
  }
});

// 댓글 삭제 (댓글 작성자 또는 게시글 작성자)
router.delete("/comments/:commentId", authRequired, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    const target = await Comment.findById(commentId).select("user post parent");
    if (!target) return res.json({ ok: true });

    // 🔁 게시글 작성자 필드명은 보통 'user'
    const postDoc = await CommunityPost.findById(target.post).select("user");
    const isCommentOwner =
      (target.user?.equals && target.user.equals(userId)) || String(target.user) === String(userId);
    const isPostOwner =
      (postDoc?.user?.equals && postDoc.user.equals(userId)) || (postDoc && String(postDoc.user) === String(userId));

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({ ok: false, message: "삭제 권한이 없습니다." });
    }

    const children = await Comment.countDocuments({ parent: target._id });
    await Comment.deleteMany({ $or: [{ _id: target._id }, { parent: target._id }] });

    await CommunityPost.findByIdAndUpdate(target.post, { $inc: { comments: -(1 + children) } });
    if (target.parent) await Comment.findByIdAndUpdate(target.parent, { $inc: { replies: -1 } });

    res.json({ ok: true, deleted: 1 + children });
  } catch (e) {
    console.error("[comment delete]", e);
    res.status(500).json({ ok: false, message: "댓글 삭제 실패" });
  }
});

export default router;
