import express from "express";
import { bookmarkFolder, createFolder, getAllFolders, getFolderDetail, getTopTypedFolders  } from "../../controllers/archiveBookmark/bookmarkController.js";

const bookmarkNewFolder = express.Router()

bookmarkNewFolder.get("/newFolder", bookmarkFolder)
bookmarkNewFolder.post("/folder", createFolder)
bookmarkNewFolder.get("/folders", getAllFolders)
bookmarkNewFolder.get("/folders/top", getTopTypedFolders);
bookmarkNewFolder.get("/folders/:id", getFolderDetail);

export default bookmarkNewFolder