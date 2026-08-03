import mongoose from "mongoose";

const downloadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofiles",
      required: true,
    },

    userPlan: {
      type: String,
      enum: ["Free", "Bronze", "Silver", "Gold"],
      default: "Free",
    },

    videoTitle: {
      type: String,
      required: true,
    },

    videoFile: {
      type: String,
      required: true,
    },

    downloadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Download", downloadSchema);