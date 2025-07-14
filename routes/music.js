// routes/music.js
import express from "express";
import { getMusicByKeywordAndGenre } from "../controllers/musicController.js";

const router = express.Router();

router.post("/recommend", getMusicByKeywordAndGenre);

export default router;

