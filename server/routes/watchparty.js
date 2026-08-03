import express from "express";

import {
  createWatchParty,
  getWatchParty,
  closeWatchParty,
} from "../controllers/watchparty.js";

const router =
  express.Router();


// Create room
router.post(
  "/create",
  createWatchParty
);


// Get room
router.get(
  "/:roomId",
  getWatchParty
);


// Close room
router.delete(
  "/:roomId",
  closeWatchParty
);


export default router;