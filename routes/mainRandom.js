// routes/mainRandom.js
import express from "express";
import scriptSchema from "../models/main/scriptSchema.js";

const router = express.Router();

router.get("/random", async (req, res) => {
  try {
    const result = await scriptSchema.aggregate([
      { $sample: { size: 1 } }
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: "글이 없습니다." });
    }

    res.json(result[0]);
  } catch (err) {
    console.error("메인 랜덤 글 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

export default router;
