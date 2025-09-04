import { Schema, model } from "mongoose";
import { getCurrentTime } from "../utils/utils.js";

const userSchema = new Schema({
  name: String,
  phonenum: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, required: true, unique: true },
  token: String,
  provider: { type: String, default: "local" },

  level:{ type: Number, default: 1 },
  exp: { type: Number, default: 0 },

  // 연속 출석 관련 필드
  consecutiveLoginDays: { type: Number, default: 0 },
  lastLoginDate: { type: String, default: "" },

  // 프로필 이미지 경로 필드 추가
  profileImageUrl: { type: String, default: "" },

  // 커스텀 생성일·수정일 (별도 텍스트 저장용)
  createdAt: { type: String, default: getCurrentTime },
  updatedAt: { type: String, default: getCurrentTime },
},
{
  // mongoose 기본 createdAt / updatedAt 타임스탬프
  timestamps: true,
  versionKey: false, // __v 제거
});

export default model("User", userSchema, "user");

