import express from "express";
import { toggleLike, getMyLikes } from "../../controllers/community/likeController.js";

const likeRouter = express.Router();
likeRouter.post("/toggle/:id", toggleLike);     // /api/likes/toggle/:id?type=typed|played
likeRouter.get("/mine", getMyLikes);            // /api/likes/mine?type=typed&userId=...

export default likeRouter;