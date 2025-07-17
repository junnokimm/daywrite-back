import { Schema, model } from "mongoose";
import { getCurrentTime } from "../utils/utils.js";

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: String,
  name: String,
  provider: { type: String, default: "local" },
  createdAt: { type: String, default: getCurrentTime },
  updatedAt: { type: String, default: getCurrentTime },
},
  {
    timestamps: true, // createdAt, updatedAt 자동 처리
    versionKey: false, // __v 제거
  }
)

export default model("User", userSchema, "user");
