import express from "express";
import userRouter from "./user/userRouter.js";
import mainScript from "./mainScript.js";
import imagesRouter from "./images/imagesRouter.js";

const rootRouter = express.Router();

rootRouter.use("/users/api", userRouter)
rootRouter.use("/main", mainScript)
rootRouter.use("/images", imagesRouter)

export default rootRouter;