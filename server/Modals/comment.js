import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    videoid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofiles",
      required: true,
    },

    commentbody: {
      type: String,
      required: true,
    },

    usercommented: {
      type: String,
      required: true,
    },

    commentedon: {
      type: Date,
      default: Date.now,
    },

    // Users who liked this comment
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    // Users who disliked this comment
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    // Reports submitted for this comment
    reports: [
      {
        userid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },

        reason: {
          type: String,
        },

        reportedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Moderation status
    moderationStatus: {
      type: String,
      enum: [
        "visible",
        "flagged",
        "blocked",
      ],
      default: "visible",
    },

    location: {
      type: String,
      default: null,
    },

    showLocation: {
      type: Boolean,
      default: false,
    },

    language: {
      type: String,
      default: "en",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "comment",
  commentSchema
);