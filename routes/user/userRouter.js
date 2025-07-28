import express from "express";
import { 
  loginUser, modifyUser, register, removeUser, findUserId, findUserPassword, resetPassword
} from "../../controllers/user/userController.js";

const userRouter = express.Router()

// 회원가입
userRouter.post("/register", register);

// 로그인
userRouter.post("/login", loginUser)

// 회원정보 수정
userRouter.put("/login", modifyUser)

// 회원탈퇴
userRouter.delete("/login", removeUser)

// 아이디 찾기
userRouter.post('/find-id', findUserId);

// 비밀번호 찾기
userRouter.post('/find-password', findUserPassword);

// 비밀번호 재설정
userRouter.post('/reset-password', resetPassword);


export default userRouter;