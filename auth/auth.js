// passport auth 설정값 파일
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import User from "../models/userSchema.js";
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET;

// username, password를 찾아감
const passwordConfig = {
    usernameField: 'email', passwordField: 'password'
}

// 로그인 로직
const passwordVerify = async (email, password, done) => {
    try {
        const user = await User.findOne({email}).lean();
    
        //user가 없다면 로직실행
        if(!user){
            console.log("사용자 없음")
            return done(null, false, {message: "존재하지 않는 사용자입니다."})
        }
        // 유저 해쉬된 비밀번호를 비교
        const plainPassword = password;
        const hashedPassword = user.password;
    
        bcrypt.compare(plainPassword, hashedPassword, (err, result) => {
            if (err) {
                return done(err, false, { message: "알 수 없는 오류 발생!" });
            }
    
            if (result) {
                // 로그인 성공
                return done(null, user, { message: "로그인 성공!" });
            } else {
                return done(null, false, { message: "비밀번호가 일치하지 않습니다!" });
            }
        });
    } catch (error) {
        return done(err);
    }
};

const jwtConfig = {
    jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
}

const jwtVerify = async (jwtPayload, done) => {
    try {
        const email = jwtPayload.email
        const user = await User.findOne({ email : email }).lean();
        if(!user){
            return done(null, false, { message : "올바르지 않은 인증정보입니다. "})
        }
        return done(null, user);
    } catch (error) {
        return done(err);
    }
}

const initializePassport = () => {
    passport.use('local', new LocalStrategy(passwordConfig, passwordVerify));
    passport.use('jwt', new JwtStrategy(jwtConfig, jwtVerify));
};

export default initializePassport;