import { Schema, model } from "mongoose";
import { getCurrentTime } from "../utils/utils.js";
import { ObjectId } from "mongodb";

const collectionListScema = new Schema({
  bookTitle : String,
  bookSubTitle : String,
  bookContent : String,
  songTitle : String,
  songArtist : String,
  isChecked : { type: Boolean, default: false },
  createdAt: { type: String, default: getCurrentTime },
  updatedAt: { type: String, default: getCurrentTime },
  user : {typeof: ObjectId, ref: "User"}
});

export default model("CollectionList", collectionListScema, "collectionList")