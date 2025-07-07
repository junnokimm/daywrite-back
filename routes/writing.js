// routes/writing.js
import express from "express";
import scriptSchema from "../models/main/scriptSchema.js";


const router = express.Router();

// POST /api/writing/random
router.post("/random", async (req, res) => {
  const { keywords = [], genres = [] } = req.body;

  try {
    const result = await scriptSchema.aggregate([
      {
        $match: {
          keyword: { $in: keywords },
          genre: { $in: genres },
        },
      },
      { $sample: { size: 1 } } // 랜덤 1개 뽑기
    ]); 

    if (result.length === 0) {
      return res.status(404).json({ message: "해당 조건의 글이 없습니다." });
    }

    res.json(result[0]);
  } catch (err) {
    console.error("랜덤 글 가져오기 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

export default router;
