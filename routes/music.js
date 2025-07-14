import express from "express";
import { getMusicByKeywordAndGenre } from "../controllers/musicController.js";

const musicRouter = express.Router();

musicRouter.post("/recommend", getMusicByKeywordAndGenre);

export default musicRouter;
