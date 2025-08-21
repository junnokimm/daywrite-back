import connect from "./connect/connect.js";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import rootRouter from "./routes/rootRouter.js";
import passport from "passport";
import initializePassport from "./auth/auth.js";
import writingRouter from "./routes/writing.js";
import mainRouter from "./routes/mainRandom.js";
import musicRouter from "./routes/music.js";
import faqRouter from "./routes/faq/faqRouter.js";
import noticeRouter from "./routes/notice/noticeRouter.js";
import inquiryRouter from "./routes/inquiry/inquiryRouter.js";
import authRouter from "./routes/auth/authRouter.js";
import userRouter from "./routes/user/userRouter.js";
import backgroundUploadRouter from "./routes/background/backgroundUploadRouter.js";
import path from "path";

// 환경 변수 설정
dotenv.config();

// DB 연결 실행
connect();

// 앱 초기화
const app = express();
const port = 8000;

// // uploads 폴더를 정적으로 열기
// app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const __dirname = path.resolve(); // ESM 환경이라면 필요

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const CORS_OPTIONS = {
  origin: "http://localhost:3000", // * 금지, 정확히 지정
  credentials: true, // withCredentials 대응
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(CORS_OPTIONS));
app.options(/.*/, cors(CORS_OPTIONS));

// JSON 요청 본문 처리
app.use(express.json());

// 테스트 라우터
app.get("/", (req, res) => {
  res.send("서버 연결 성공!");
});

// 라우터 전에 passport 미들웨어가 먼저 실행하도록 로직 수정
// 라우터
app.use("/api/writing", writingRouter);
app.use("/api/music", musicRouter);
app.use("/api/faq", faqRouter);
app.use("/api/notice", noticeRouter);
app.use("/api/inquiry", inquiryRouter);
app.use("/api/main", mainRouter);
app.use("/auth", authRouter);
app.use("/api/upload/background", backgroundUploadRouter);


app.use(passport.initialize());
initializePassport();

// 모든 라우터는 rootRouter에서 관리
app.use("/api", rootRouter); // 여기 수정했어요

// 서버 실행
app.listen(port, () => {
  console.log(`서버 실행 중: http://localhost:${port}`);
});
