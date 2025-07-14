import { Schema, model } from "mongoose";
import { getCurrentTime } from "../utils/utils.js";

const mainScriptSchema = new Schema({
  title : { type: String, required: true },
  createdAt: { type: String, default: getCurrentTime },
  updatedAt: { type: String, default: getCurrentTime },
  // user: { type: ObjectId, ref: "User", require: true }
});

export default model("MainScript", mainScriptSchema, "mainScript")