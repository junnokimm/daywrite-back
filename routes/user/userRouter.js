import express from "express";
import { loginUser, modifyUser, register, removeUser } from "../../controllers/user/userController.js";

const userRouter = express.Router()

// 회원가입
userRouter.post("/register", register);

// 로그인
userRouter.post("/login", loginUser)

// 회원정보 수정
userRouter.put("/login", modifyUser)

// 회원탈퇴
userRouter.delete("/login", removeUser)


export default userRouter;