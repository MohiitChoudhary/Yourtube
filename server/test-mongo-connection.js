import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const DBURL = process.env.DB_URL;

if (!DBURL) {
  console.error("No DB_URL found in environment. Check server/.env");
  process.exit(1);
}

(async () => {
  try {
    console.log("Attempting to connect to:", DBURL.replace(/(:).*@/, ":*****@"));
    await mongoose.connect(DBURL, {
      dbName: process.env.DB_NAME || "test",
      serverSelectionTimeoutMS: 10000,
    });
    console.log("Connected to MongoDB successfully");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Connection failed:", err && err.message ? err.message : err);
    if (err && err.stack) console.error(err.stack);
    process.exit(1);
  }
})();
