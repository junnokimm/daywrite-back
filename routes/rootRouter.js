import express from "express";
import userRouter from "./user/userRouter.js";

const rootRouter = express.Router();

rootRouter.use("/users/api", userRouter)

export default rootRouter;