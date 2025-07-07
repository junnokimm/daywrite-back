import express from "express";
import userRouter from "./user/userRouter.js";
import faqRouter from "./faq/faqRouter.js";

const rootRouter = express.Router();

rootRouter.use("/users/api", userRouter)

rootRouter.use('/faq', faqRouter);

export default rootRouter;