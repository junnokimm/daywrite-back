import { Schema, model } from "mongoose";

const playListSchema = new Schema({
  title: String,
  artist: String,
  likedAt: { type: Date, default: Date.now }
});

export default model ("Playlist", playListSchema, "playlist");