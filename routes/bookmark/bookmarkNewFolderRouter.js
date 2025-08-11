import express from "express";
import { bookmarkFolder, createFolder, getAllFolders } from "../../controllers/archiveBookmark/bookmarkController.js";

const bookmarkNewFolder = express.Router()

bookmarkNewFolder.get("/newFolder", bookmarkFolder)
bookmarkNewFolder.post("/folder", createFolder)
bookmarkNewFolder.get("/folders", getAllFolders)

export default bookmarkNewFolder