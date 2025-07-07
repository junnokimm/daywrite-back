import mongoose from 'mongoose';

const writingSchema = new mongoose.Schema({
  content: { type: String, required: true },        // 필사 내용
  book: { type: String, required: true },           // 책 제목
  author: { type: String, required: true },         // 저자
  publisher: { type: String },                      // 출판사 (선택)
  publishedDate: { type: String },                  // 출간일 (ISO 형식 문자열)
  bookCover: { type: String },                      // 표지 이미지 URL
  keyword: [{ type: String }],                      // 키워드 배열
  genre: [{ type: String }]                         // 장르 배열
}, {
  collection: 'scripts' 
});

export default mongoose.model('Writing', writingSchema);
