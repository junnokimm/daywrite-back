import express from 'express';
import Notice from '../../models/noticeSchema.js';

const router = express.Router();

// 공지사항 전체 조회
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 }); // 최신순 정렬
    res.status(200).json(notices);
  } catch (err) {
    res.status(500).json({ message: '공지사항 조회 실패', error: err.message });
  }
});

export default router;