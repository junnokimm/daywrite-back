import express from "express";
import userRouter from "./user/userRouter.js";
import mainScript from "./mainScript.js";
import imagesRouter from "./images/imagesRouter.js";
import faqRouter from "./faq/faqRouter.js";
import noticeRouter from './notice/noticeRouter.js';

const rootRouter = express.Router();

rootRouter.use("/users/api", userRouter)
rootRouter.use("/main", mainScript)
rootRouter.use("/images", imagesRouter)
rootRouter.use('/faq', faqRouter);
rootRouter.use('/notice', noticeRouter);

export default rootRouter;