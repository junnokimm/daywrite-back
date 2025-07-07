import { fileURLToPath } from 'url';
import path from 'path';
import mongoose from "mongoose";
import Writing from "../models/Writing.js";
import fs from 'fs';

// 현재 파일의 __dirname 계산
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 경로 안정화
const filePath = path.join(__dirname, '../dummyData/junnyData.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// DB 연결 및 업로드
await mongoose.connect('mongodb+srv://1endloopdaywrite:1234@cluster0.eibaawc.mongodb.net/');
await Writing.insertMany(data);
console.log('더미데이터 업로드 완료');
process.exit();

// 