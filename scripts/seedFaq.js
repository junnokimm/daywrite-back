import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Faq from '../models/faqSchema.js';

dotenv.config();
await mongoose.connect(process.env.MONGO_URL);

await Faq.insertMany([
  {
    question: '주문을 취소하고 싶어요',
    answer: 'My > 주문배송조회에서 즉시 취소 또는 취소 요청이 가능합니다.',
  },
  {
    question: '배송은 얼마나 걸리나요?',
    answer: '보통 2~3일 내 도착합니다.',
  },
]);

console.log('✅ FAQ 데이터 삽입 완료');
mongoose.disconnect();
