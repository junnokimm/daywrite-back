// rootRouter.js 부분

import express from "express";
import userRouter from "./user/userRouter.js";
import mainScript from "./mainScript.js";
import imagesRouter from "./images/imagesRouter.js";
import faqRouter from "./faq/faqRouter.js";
import noticeRouter from "./notice/noticeRouter.js";
import historyRouter from "./history/historyRouter.js";
import bookmarkRouter from "./bookmark/bookmarkRouter.js";
import authRouter from "./auth/authRouter.js";
import backgroundUploadRouter from "./background/backgroundUploadRouter.js";
import bookmarkNewFolder from "./bookmark/bookmarkNewFolderRouter.js";
import playList from "./bookmark/playListRouter.js";
import communityRouter from "./community/communityRouter.js";
import likeRouter from "./community/likeRouter.js";
import commentRouter from "./community/commentRouter.js";

const rootRouter = express.Router();

rootRouter.use("/users", userRouter);
rootRouter.use("/main", mainScript);
rootRouter.use("/history", historyRouter);
rootRouter.use("/bookmarks", bookmarkRouter);
rootRouter.use("/images", imagesRouter);
rootRouter.use("/faq", faqRouter);
rootRouter.use("/notice", noticeRouter);
rootRouter.use("/auth", authRouter);
rootRouter.use("/bookmarkFolder", bookmarkNewFolder);
rootRouter.use("/playList", playList);
rootRouter.use("/community", communityRouter);
rootRouter.use("/likes", likeRouter);
rootRouter.use("/community", commentRouter);

export default rootRouter;
