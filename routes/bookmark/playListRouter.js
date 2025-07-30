import express from "express";
import { saveLikedSongs, getLikedSongs, unlikeSong, createPlayedFolder, getAllPlayedFolders } from "../../controllers/archiveBookmark/playedListController.js";
import { uploadPlayed } from "../../utils/uploadImg.js";

const playList = express.Router();

playList.post("/liked", saveLikedSongs); // POST /api/playlist/liked
playList.post("/unlike", unlikeSong)
playList.get("/liked", getLikedSongs);
playList.post("/folder", uploadPlayed.single("thumbnail"), createPlayedFolder);
playList.get("/folders", getAllPlayedFolders);

export default playList;