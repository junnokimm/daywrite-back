import express from "express";
import { 
        saveLikedSongs, getLikedSongs, unlikeSong, createPlayedFolder, getAllPlayedFolders, 
        getPlayedFolderDetail, getTopPlayedFolders, updatePlayedFolderTitle, deletePlayedFolder
    } from "../../controllers/archiveBookmark/playedListController.js";
import { uploadPlayed } from "../../utils/uploadImg.js";

const playList = express.Router();

playList.post("/liked", saveLikedSongs); // POST /api/playlist/liked
playList.post("/unlike", unlikeSong)
playList.get("/liked", getLikedSongs);
playList.post("/folder", uploadPlayed.single("thumbnail"), createPlayedFolder);
playList.get("/folders", getAllPlayedFolders);
playList.get("/folders/top", getTopPlayedFolders);
playList.get("/folders/:id", getPlayedFolderDetail);
playList.put("/folders/:id", updatePlayedFolderTitle);
playList.delete("/folders/:id", deletePlayedFolder);

export default playList;