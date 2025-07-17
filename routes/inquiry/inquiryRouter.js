// routes/inquiry/inquiryRouter.js
import express from 'express';
import Inquiry from '../../models/inquirySchema.js';

const router = express.Router();

// 문의 등록 (POST)
router.post('/', async (req, res) => {
  try {
    const { type, email, title, content } = req.body;
    const newInquiry = new Inquiry({ type, email, title, content });
    await newInquiry.save();
    res.status(201).json({ message: '문의 등록 완료' });
  } catch (err) {
    res.status(500).json({ message: '문의 등록 실패', error: err.message });
  }
});

// 문의 전체 조회 (GET)
router.get('/', async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ message: '조회 실패', error: err.message });
  }
});

export default router;