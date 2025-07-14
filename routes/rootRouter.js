import express from "express";
import userRouter from "./user/userRouter.js";
import musicRouter from "./music.js"
import router from "./music.js";

const rootRouter = express.Router();

rootRouter.use("/users/api", userRouter)
router.use("/api/music", musicRouter)

export default rootRouter;