import mongoose, { mongo } from "mongoose";

const connection_url = `mongodb+srv://1endloopdaywrite:cyVCvCjp4ahuZAl3@cluster0.oy2hccr.mongodb.net/daywrite?retryWrites=true&w=majority`;

const connect = () => {
  if (process.env.NODE_ENV !== "production") {
    mongoose.set("debug", true);
  }

  mongoose
    .connect(connection_url, {
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
