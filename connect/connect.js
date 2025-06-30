import mongoose, { mongo } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connection_URI = process.env.MONGO_URI;

const connect = () => {
  if (process.env.NODE_ENV !== "production") {
    mongoose.set("debug", true);
  }

  mongoose
    .connect(connection_URI, {
      dbName: "daywrite", // 컬렉션을 관리하는 DB 이름
    })
    .then(() => {
      console.log("MongoDB 연결 성공");
    })
    .catch((err) => {
      console.error("MongoDB 연결 실패");
    });
};

export default connect;
