// scripts/seedFaq.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// models 불러오기
import Faq from '../models/faqSchema.js';

// __dirname 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env 로드
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedFaq = async () => {
  try {
    console.log('📡 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB 연결 성공');

    const deleteResult = await Faq.deleteMany();
    console.log('🧹 기존 FAQ 삭제 결과:', deleteResult);

    const insertResult = await Faq.insertMany([
      {
        question: '주문을 취소하고 싶어요',
        answer: 'My > 주문배송조회에서 즉시 취소 또는 취소 요청이 가능합니다.',
      },
      {
        question: '배송은 얼마나 걸리나요?',
        answer: '보통 2~3일 내 도착합니다.',
      },
    ]);
    console.log('✅ FAQ 데이터 삽입 결과:', insertResult);

    const allFaqs = await Faq.find();
    console.log('🔍 현재 FAQ 컬렉션 데이터:', allFaqs);

    await mongoose.disconnect();
    console.log('🔌 DB 연결 해제 완료');
    process.exit(0);
  } catch (err) {
    console.error('❌ 에러 발생:', err);
    process.exit(1);
  }
};

seedFaq();



