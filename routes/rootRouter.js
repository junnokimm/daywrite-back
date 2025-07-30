import express from "express";
import userRouter from "./user/userRouter.js";
import mainScript from "./mainScript.js";
import imagesRouter from "./images/imagesRouter.js";
import faqRouter from "./faq/faqRouter.js";
import noticeRouter from "./notice/noticeRouter.js";
import historyRouter from "./history/historyRouter.js";
import bookmarkRouter from "./bookmark/bookmarkRouter.js";
import authRouter from "./auth/authRouter.js";
import bookmarkNewFolder from "./bookmark/bookmarkNewFolderRouter.js";
import playList from "./bookmark/playListRouter.js";

const rootRouter = express.Router();

rootRouter.use("/users/api", userRouter);
rootRouter.use("/main", mainScript);
rootRouter.use("/api/history", historyRouter);
rootRouter.use("/api/bookmarks", bookmarkRouter);
rootRouter.use("/images", imagesRouter);
rootRouter.use("/faq", faqRouter);
rootRouter.use("/notice", noticeRouter);
rootRouter.use("/auth/", authRouter)
rootRouter.use("/bookmarkFolder", bookmarkRouter);
rootRouter.use("/NewFolder", bookmarkNewFolder);
rootRouter.use('/bookmarks', bookmarkNewFolder);
rootRouter.use("/api/playList", playList);

export default rootRouter;
