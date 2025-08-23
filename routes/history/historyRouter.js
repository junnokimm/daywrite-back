import express from "express";
import History from "../../models/historySchema.js";

const router = express.Router();

// 저장 API
router.post("/", async (req, res) => {
  console.log("📥 POST /history 요청 도착", req.body);
  try {
    const { userId } = req.body;

    // 1) 로그인/권한 체크 (간단 버전)
    if (!userId) {
      return res.status(401).json({ message: "로그인 후 이용 가능합니다.(userId 누락)" });
    }

    // ※ JWT/세션을 쓰면 여기서 토큰 검증 + userId 일치 확인 로직을 추가하는 게 베스트
    const newHistory = new History(req.body);
    await newHistory.save();
    res.status(201).json({ message: "저장 성공", data: newHistory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "저장 실패", error: error?.message });
  }
});

// 조회 API
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const historyList = await History.find({ userId }).sort({ createdAt:-1 });
    res.status(200).json(historyList);
  } catch (err) {
    res.status(500).json({ message: "히스토리 조회 실패" });
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
