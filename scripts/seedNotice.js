// scripts/noticeSeeder.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notice from '../models/noticeSchema.js';
import noticeData from '../dummyData/noticeData.js';

dotenv.config(); // .env에서 MONGODB_URI 가져옴

const seedNotice = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📡 MongoDB 연결 성공');

    await Notice.deleteMany();
    console.log('🧹 기존 공지사항 데이터 제거');

    await Notice.insertMany(noticeData);
    console.log('✅ 공지사항 더미 데이터 삽입 완료');

    process.exit();
  } catch (error) {
    console.error('❌ 공지사항 시드 실패:', error.message);
    process.exit(1);
  }
};

seedNotice();