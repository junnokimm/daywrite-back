import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const localStrategy = async (req, res, next) => {
  try {
    const authenticatedUser = req.user; // passport-local이 채워줌
    if (!authenticatedUser) {
      return res.status(400).json({ message: "인증 실패" });
    }

    // 세션 안 씀
    req.login(authenticatedUser, { session: false }, async (loginError) => {
      if (loginError) {
        return res.status(400).json({ message: "알 수 없는 오류 발생!" });
      }

      // authRequired가 사용하는 userId 포함
      const accessToken = jwt.sign(
        {
          userId: String(authenticatedUser._id),
          email: authenticatedUser.email,
          issuer: "daywrite",
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // 응답에 user도 같이 내려줌
      const { password, ...user } = authenticatedUser.toObject ? authenticatedUser.toObject() : authenticatedUser;

      return res.status(200).json({
        message: "로그인 성공",
        accessToken, // ← 프론트에서 accessToken으로 저장
        user,
      });
    });
  } catch (e) {
    console.error("[localStrategy]", e);
    return res.status(500).json({ message: "로그인 처리 실패" });
  }
};

export const jwtStrategy = async (req, res, next) => {
  try {
    const jwtAuthenticatedUser = req.user;
    const { password, ...user } = jwtAuthenticatedUser?.toObject
      ? jwtAuthenticatedUser.toObject()
      : jwtAuthenticatedUser;

    return res.status(200).json({
      message: "자동 로그인 성공",
      user,
    });
  } catch (error) {
    console.error("authController jwtStrategy error", error);
    next(error);
  }
};
