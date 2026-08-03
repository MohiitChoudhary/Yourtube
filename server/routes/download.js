import express from "express";

import {
  downloadVideo,
  getUserDownloads,
} from "../controllers/download.js";

const router = express.Router();

// Start video download
router.post("/", downloadVideo);

// Get all downloads of a user
router.get("/user/:userId", getUserDownloads);

export default router;