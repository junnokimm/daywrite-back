// passport auth 설정값 파일
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import User from "../models/userSchema.js";
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()
const SECRET_KEY = process.env.SECRET_KEY;


// username, password
const passwordConfig = {
    usernameField: 'email', passwordField: 'password'
}

// 로그인 로직
const passwordVerify = async (email, password, done) => {
    const user = await User.findOne({email : email}).lean();

    if(!user){
        console.log("로직 실행")
        return done(null, false, {message: "존재하지 않는 사용자입니다."})
    }

    // 유저 해쉬된 비밀번호를 비교
    const plainPassword = password;
    const hashedPassword = user.password;

    bcrypt.compare(plainPassword, hashedPassword, (err, result) => {
        if(err){
            return done(err)
        }
        
        if(result){
            // 로그인 성공
            return done(null, user)
        }else {
            return done(null, false, { message: '올바르지 않은 비밀번호 입니다.'})
        }
    })
}

const jwtConfig = {
    jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
}

const jwtVerify = async (jwtPayload, done) => {
    const email = jwtPayload.email
    const user = await User.findOne({email : email}).lean();
    if(!user){
        done(null, false, { message : "올바르지 않은 인증정보입니다. "})
    }

    return done(null, user);
}

const initializePassport = () => {
    passport.use('local', new LocalStrategy(passwordConfig, passwordVerify))
    passport.use('jwt', new JwtStrategy(jwtConfig, jwtVerify))
}

export default initializePassport;