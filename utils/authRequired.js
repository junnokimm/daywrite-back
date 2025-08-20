import jwt from "jsonwebtoken";

export default function authRequired(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: "인증 필요" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // payload.userId 가 문자열이라고 가정 (예: "665d9a...") 
    // ObjectId로 왔다면 String(payload.userId)로 변환
    req.userId = typeof payload.userId === "string"
      ? payload.userId
      : String(payload.userId);

    next();
  } catch (e) {
    return res.status(401).json({ message: "토큰 검증 실패" });
  }
}
