import express from "express";
import History from "../../models/historySchema.js";

const router = express.Router();

// 저장 API
router.post("/", async (req, res) => {
  console.log("📥 POST /history 요청 도착", req.body); // 🔍 확인용
  try {
    const newHistory = new History(req.body);
    await newHistory.save();
    res.status(201).json({ message: "저장 성공", data: newHistory });
  } catch (error) {
    res.status(500).json({ message: "저장 실패", error });
  }
});

// 조회 API
router.get("/", async (req, res) => {
  try {
    const histories = await History.find().sort({ createdAt: -1 });
    res.status(200).json(histories);
  } catch (error) {
    res.status(500).json({ message: "조회 실패", error });
  }
});

// DELETE /api/history/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await History.findByIdAndDelete(id);
    res.status(200).json({ message: "삭제 완료" });
  } catch (error) {
    res.status(500).json({ error: "삭제 실패" });
  }
});

export default router;
