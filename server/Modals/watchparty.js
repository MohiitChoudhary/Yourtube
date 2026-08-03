import mongoose from "mongoose";

const watchPartySchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
    },

    videoId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    hostId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "watchparty",
  watchPartySchema
);