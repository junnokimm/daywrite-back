import express from "express";
import { saveLikedSongs, getLikedSongs } from "../../controllers/archiveBookmark/playedListController.js";

const playList = express.Router();

playList.post("/liked", saveLikedSongs); // POST /api/playlist/liked
playList.get("/liked", getLikedSongs); 

export default playList;