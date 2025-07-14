import connect from "./connect/connect.js";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import rootRouter from "./routes/rootRouter.js";
import writingRouter from './routes/writing.js'
import mainRouter from "./routes/mainRandom.js"
import musicRouter from "./routes/music.js"

// 환경 변수 설정
dotenv.config();

// DB 연결 실행
connect();

// 앱 초기화
const app = express();
const port = 8000;

// cors 설정
// app.use()는 미들웨어로서 어떤 요청이든 지정된 로직보다 먼저 작업한다.
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    // credentials: true, // 로그인 기능 추가 시 필요함. 프론트에서도 withCredentials: true 필요!
  })
);

// JSON 요청 본문 처리
app.use(express.json());

// 테스트 라우터
app.get("/", (req, res) => {
  res.send("서버 연결 성공!");
});


// 라우터
app.use('/api/writing', writingRouter);
// app.use("/api/music", musicRouter)
app.use("/api/music", musicRouter)
app.use("/", rootRouter);
app.use("/api/main", mainRouter);

// 서버 실행
app.listen(port, () => {
  console.log(`서버 실행 중: http://localhost:${port}`);
});
