import express from "express"
import { register } from "../controllers/user/main/mainScriptController.js";

const mainScript = express.Router();

mainScript.post("/api/register", register)

export default mainScript;