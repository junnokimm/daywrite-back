import express from "express";
import Bookmark from "../../models/bookmarkSchema.js";
import History from "../../models/historySchema.js";

const router = express.Router();

// 북마크 추가
router.post("/", async (req, res) => {
  const { userId, historyId, folderId = 1 } = req.body;
  try {
    const exists = await Bookmark.findOne({ userId, historyId });
    if (exists) return res.status(400).json({ message: "이미 북마크됨" });

    const bookmark = new Bookmark({ userId, historyId, folderId });
    await bookmark.save();
    res.status(201).json(bookmark);
  } catch (err) {
    res.status(500).json({ message: "북마크 저장 실패", error: err.message });
  }
});

// 북마크 삭제
router.delete("/", async (req, res) => {
  const { userId, historyId } = req.body;
  try {
    await Bookmark.deleteOne({ userId, historyId });
    res.status(200).json({ message: "삭제됨" });
  } catch (err) {
    res.status(500).json({ message: "삭제 실패", error: err.message });
  }
});

// 북마크 조회 (히스토리 내용 포함)
router.get("/", async (req, res) => {
  const { userId, folderId = 1 } = req.query;

  try {
    const bookmarks = await Bookmark.find({ userId, folderId }).populate("historyId");

    const formatted = bookmarks
      .filter((b) => b.historyId !== null) // 👈 이 줄이 핵심!!
      .map((b) => ({
        ...b.historyId.toObject(),
        bookmarkId: b._id,
        folderId: b.folderId,
      }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "조회 실패", error: err.message });
  }
});

export default router;
