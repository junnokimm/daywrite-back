import jwt from "jsonwebtoken";
import User from "../models/userSchema.js";

export default async function authRequired(req, res, next) {
  try {
    const h = req.headers?.authorization || req.headers?.Authorization || "";
    const headerToken = h.startsWith("Bearer ") ? h.slice(7) : null;
    const cookieToken = req.cookies?.accessToken || req.cookies?.token || req.cookies?.jwtToken || null;
    const qOrBodyToken = req.query?.accessToken || req.body?.accessToken || req.query?.token || req.body?.token || null;

    const token = headerToken || cookieToken || qOrBodyToken;
    if (!token) return res.status(401).json({ message: "인증 필요" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 1) 정상 케이스: userId 들어있는 토큰
    let userId =
      (typeof payload.userId === "string" && payload.userId) ||
      (payload.userId != null ? String(payload.userId) : null);

    // 2) 과거 토큰 대응: email만 있을 때 DB에서 유저 조회해서 userId 세팅
    if (!userId && payload.email) {
      const user = await User.findOne({ email: payload.email }).select("_id");
      if (!user) return res.status(401).json({ message: "사용자를 찾을 수 없습니다." });
      userId = String(user._id);
    }

    if (!userId) return res.status(401).json({ message: "토큰에 사용자 정보가 없습니다." });

    req.userId = userId;
    next();
  } catch (e) {
    // console.log("[authRequired] fail:", e?.message);
    return res.status(401).json({ message: "토큰 검증 실패" });
  }
}
