import mongoose from "mongoose";
import Like from "../../models/community/likeSchema.js";
import BookmarkFolder from "../../models/bookmark/bookmarkFolderSchema.js";
import BookmarkPlayedFolder from "../../models/bookmark/bookmarkPlayedFolderSchema.js";

const pickModel = (type) => type === "typed" ? BookmarkFolder : BookmarkPlayedFolder;

export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;            // 대상 폴더 ObjectId
    const { type } = req.query;           // 'typed' | 'played'
    const userId = req.user?.id || req.body.userId || req.query.userId;

    if (!["typed", "played"].includes(type)) {
      return res.status(400).json({ message: "type 오류 (typed|played)" });
    }
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "유효하지 않은 ID" });
    }

    const Model = pickModel(type);
    const target = await Model.findById(id).select("_id");
    if (!target) return res.status(404).json({ message: "대상을 찾을 수 없음" });

    // 이미 눌렀는지 확인
    const existing = await Like.findOne({ user: userId, targetId: id, targetType: type }).lean();

    if (!existing) {
      // 좋아요 추가 (중복 방지: upsert)
      const up = await Like.updateOne(
        { user: userId, targetId: id, targetType: type },
        { $setOnInsert: { user: userId, targetId: id, targetType: type, createdAt: new Date() } },
        { upsert: true }
      );

      // upsert로 "새로 생겼을 때만" +1
      if (up.upsertedCount > 0) {
        await Model.updateOne({ _id: id }, { $inc: { likeCount: 1 } });
      }

      const fresh = await Model.findById(id).select("likeCount").lean();
      return res.json({ liked: true, likeCount: fresh.likeCount ?? 0 });
    } else {
      // 좋아요 취소 (실제 삭제가 되었을 때만 -1)
      const del = await Like.deleteOne({ _id: existing._id });
      if (del.deletedCount > 0) {
        // 음수 방지: likeCount > 0 인 경우에만 감소
        await Model.updateOne({ _id: id, likeCount: { $gt: 0 } }, { $inc: { likeCount: -1 } });
      }
      const fresh = await Model.findById(id).select("likeCount").lean();
      return res.json({ liked: false, likeCount: fresh.likeCount ?? 0 });
    }
  } catch (err) {
    console.error("toggleLike 실패:", err);
    res.status(500).json({ message: "서버 에러" });
  }
};

export const getMyLikes = async (req, res) => {
  try {
    const { type, userId } = req.query;
    const uid = req.user?.id || userId;
    if (!uid) return res.status(400).json({ message: "userId 필요" });
    const rows = await Like.find({ user: uid, targetType: type }).select("targetId").lean();
    res.json({ ids: rows.map(r => String(r.targetId)) });
  } catch (err) {
    console.error("getMyLikes 실패:", err);
    res.status(500).json({ message: "서버 에러" });
  }
};