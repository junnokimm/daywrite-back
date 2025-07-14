// routes/faq/faqRouter.js
import express from 'express';
import Faq from '../../models/faqSchema.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const faqs = await Faq.find();
    res.status(200).json(faqs);
  } catch (err) {
    res.status(500).json({ message: 'FAQ 조회 실패', error: err.message });
  }
});

export default router;
