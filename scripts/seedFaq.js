import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import Faq from '../models/faqSchema.js';
import faqData from '../dummyData/faqData.js';

// __dirname 설정 (ESM 환경용)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ dotenv 설정 (.env가 프로젝트 루트에 위치한다고 가정)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!mongoUri) {
  console.error('❌ MONGO_URI가 undefined입니다. .env 파일을 확인하세요.');
  process.exit(1);
}

const seedFaq = async () => {
  try {
    console.log('🟡 MongoDB 연결 중...');
    await mongoose.connect(mongoUri);
    console.log('🟢 MongoDB 연결 성공');

    await Faq.deleteMany();
    console.log('🧹 기존 FAQ 삭제 완료');

    console.log('📦 삽입할 데이터:', faqData);

    const result = await Faq.insertMany(faqData);
    console.log(`✅ 총 ${result.length}개의 FAQ가 성공적으로 삽입되었습니다.`);
  } catch (err) {
    console.error('❌ 삽입 중 오류 발생:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  }
};

seedFaq();
