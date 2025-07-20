import express from "express";
import passport from "passport";
import { jwtStrategy, localStrategy } from "../../controllers/auth/authController.js";


const authRouter = express.Router();

// 이메일, 비밀번호 로그인 전략
authRouter.post("/local", passport.authenticate('local', { session : false }), localStrategy)

// jwt 토큰 전략
authRouter.post("/jwt", passport.authenticate('jwt', {session: false}), jwtStrategy)

export default authRouter;