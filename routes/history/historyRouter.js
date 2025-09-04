import express from "express";
import History from "../../models/historySchema.js";
import User from "../../models/userSchema.js";
import Level from "../../utils/leve.js";

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

    // 2) 히스토리 저장
    const newHistory = new History(req.body);
    await newHistory.save();
    
    // 3) 필사 완료 보상 지급
    const reward = Level.calculateHistorySaveReward();
    console.log("💰 필사 완료 보상:", reward);
    
    // 4) 사용자 정보 가져오기
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }
    
    // 5) 새로운 총 경험치와 레벨 계산
    const newTotalExp = user.exp + reward.totalExp;
    const levelInfo = Level.calculateLevelFromExp(newTotalExp);
    const oldLevel = user.level || 1;
    const newLevel = levelInfo.level;
    
    // 6) 사용자 정보 업데이트
    await User.findByIdAndUpdate(userId, {
      exp: newTotalExp,
      level: newLevel
    });
    
    let expMessage = `+${reward.totalExp}XP 획득!`;
    if (newLevel > oldLevel) {
      expMessage += ` 레벨업! ${oldLevel} → ${newLevel}`;
      console.log(`🎉 필사로 레벨업! ${oldLevel} → ${newLevel}`);
    }
    
    res.status(201).json({ 
      message: "저장 성공", 
      data: newHistory,
      reward: {
        ...reward,
        levelUp: newLevel > oldLevel,
        oldLevel,
        newLevel,
        newTotalExp: newTotalExp,
        expMessage
      }
    });
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
