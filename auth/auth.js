import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import User from "../models/userSchema.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

// username, password를 찾아감
const passwordConfig = {
  usernameField: "email",
  passwordField: "password",
};

// 로그인 로직
const passwordVerify = async (email, password, done) => {
  try {
    console.log('Passport 로그인 시도:', { email });
    const user = await User.findOne({ email }).lean();

    //user가 없다면 로직실행
    if (!user) {
      console.log("사용자 없음");
      return done(null, false, { message: "존재하지 않는 사용자입니다." });
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
        console.log('Passport 인증 성공:', user.email);
        return done(null, user, { message: "로그인 성공!" });
      } else {
        console.log('비밀번호 불일치');
        return done(null, false, { message: "비밀번호가 일치하지 않습니다!" });
      }
    });
  } catch (error) {
    return done(error);
  }
};

const cookieExtractor = (req) => req?.cookies?.accessToken || null;

const jwtConfig = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(), // Bearer 허용
    cookieExtractor, // 쿠키 허용
  ]),
  secretOrKey: process.env.JWT_SECRET,
};

const jwtVerify = async (jwtPayload, done) => {
  try {
    
    // id / _id / email 다 체크
    const id = jwtPayload?.id || jwtPayload?._id;
    const email = jwtPayload?.email;

    let user = null;
    if (id) {
      user = await User.findById(id).lean();
    }
    if (!user && email) {
      user = await User.findOne({ email }).lean();
    }

    if (!user) {
      return done(null, false, { message: "올바르지 않은 인증정보입니다." });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
};

const initializePassport = () => {
  passport.use("local", new LocalStrategy(passwordConfig, passwordVerify));
  passport.use("jwt", new JwtStrategy(jwtConfig, jwtVerify));
};

export default initializePassport;
