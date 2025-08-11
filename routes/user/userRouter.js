import express from "express";
import { 
  loginUser, modifyUser, register, removeUser, findUserId, findUserPassword, resetPassword,
  checkNickname, checkEmail
} from "../../controllers/user/userController.js";
import upload from "../../middlewares/uploadMiddleware.js";

const userRouter = express.Router();

// 회원가입
userRouter.post("/register", register);

// 로그인
userRouter.post("/login", loginUser);

// ✅ 회원정보 수정 (이미지 포함)
userRouter.put("/:id", upload.single("profileImage"), modifyUser);

// 회원탈퇴
userRouter.delete("/:id", removeUser);

// 아이디 찾기
userRouter.post('/find-id', findUserId);

// 비밀번호 찾기
userRouter.post('/find-password', findUserPassword);

// 비밀번호 재설정
userRouter.post('/reset-password', resetPassword);

// 회원가입시 - 닉네임 중복확인 설정
userRouter.get('/check-nickname', checkNickname)

// 회원가입시 - 아이디 중복확인 설정
userRouter.get('/check-email', checkEmail);


export default userRouter;
