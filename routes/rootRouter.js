import express from "express";
import userRouter from "./user/uesrRoouter.js";

const rootRouter = express.Router();

rootRouter.use("/users/api", userRouter)

export default rootRouter;