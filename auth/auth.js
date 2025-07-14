// passport auth 설정값 파일
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as KakaoStrategy } from "passport-kakao";
import { Strategy as NaverStrategy } from "passport-naver-v2";
import User from "../models/userSchema.js";
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

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
    secretOrKey : SECRET_KEY,
}

const jwtVerify = async (jwtPayload, done) => {
    const email = jwtPayload.email
    const user = await User.findOne({email : email}).lean();
    if(!user){
        done(null, false, { message : "올바르지 않은 인증정보입니다. "})
    }

    return done(null, user);
}

const googleConfig = {
    clientID : process.env.GOOGLE_ID,
    clientSecret : process.env.GOOGLE_SECRET,
    callbackURL : "/auth/google/callback"
}

const googleVerify = async (accessToken, refreshToken, profile, done) => {
    const {id, emails, displayName, pricture, providier} = profile;
    const email = emails[0].value;

    try {
        let exUser = null
        exUser = await User.findOne({email: email}).lean()

        // 만약 유저가 없다면 회원가입
        if(!exUser){

            await User.create({
                email : email,
                name : displayName,
                picture : pricture || "none_picture.jpg",
                picturePath : "default",
                provider : "google"
            })

            // 회원가입 후 조회
            exUser = await User.findOne({ email: email }).lean();
        }

        const accessToken = jwt.sign(
            {
                email : email,
                issuer : 'sehwan',
            },
            SECRET_KEY,
            {
                expiresIn : '24h'
            }
        )

        // 이미 가입되었다면 토큰 발급해서 로그인,
        // 회원가입 후 토큰 발급해서 로그인
        done(null, accessToken)

    } catch (error) {
        console.log("googleVeirfy Error")
        console.error(error)
        done(error)
    }
}

// 카카오
const kakaoConfig = {
    clientID : process.env.KAKAO_KEY,
    callbackURL : "/auth/kakao/callback"
}

const kakaoVerify = async (accessToken, refreshToken, profile, done) => {
    console.log("kakaoProfile", profile)
}

const naverConfig = {
    clientID : process.env.NAVER_CLIENT_ID,
    clientSecret : process.env.NAVER_CLIENT_SECRET,
    callbackURL : "/auth/naver/callback"
}

const naverVerify = async (accessToken, refreshToken, profile, done) => {
    console.log("naverProfile", profile)
}

const initializePassport = () => {
    passport.use('local', new LocalStrategy(passwordConfig, passwordVerify))
    passport.use('jwt', new JwtStrategy(jwtConfig, jwtVerify))
    passport.use('google', new GoogleStrategy(googleConfig, googleVerify))
    passport.use('kakao', new KakaoStrategy(kakaoConfig, kakaoVerify))
    passport.use('naver', new NaverStrategy(naverConfig, naverVerify))
}

export default initializePassport;