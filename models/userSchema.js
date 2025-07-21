import { Schema, model } from "mongoose";
import { getCurrentTime } from "../utils/utils.js";

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, required: true, unique: true },
  name: String,
  token: String,
  provider: { type: String, default: "local" },

  createdAt: { type: String, default: getCurrentTime }, // 회원정보 수정
  updatedAt: { type: String, default: getCurrentTime }, // 회원 탈퇴
},
  {
    timestamps: true, // createdAt, updatedAt 자동 처리
    versionKey: false, // __v 제거
  }
)

export default model("User", userSchema, "user");
