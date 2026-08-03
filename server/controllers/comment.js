import comment from "../Modals/comment.js";
import mongoose from "mongoose";


// ==========================================
// POST COMMENT
// ==========================================

export const postcomment = async (req, res) => {
  try {
    const {
      userid,
      videoid,
      commentbody,
      usercommented,
      language,
      location,
      showLocation,
    } = req.body;

    if (
      !userid ||
      !videoid ||
      !commentbody
    ) {
      return res.status(400).json({
        message:
          "userid, videoid and commentbody are required",
      });
    }

    const newComment =
      new comment({
        userid,
        videoid,
        commentbody,
        usercommented,
        language:
          language || "en",
        location:
          showLocation
            ? location
            : null,
        showLocation:
          showLocation || false,
      });

    await newComment.save();

    return res.status(201).json({
      comment: true,
      data: newComment,
    });

  } catch (error) {

    console.error(
      "Post comment error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong",
    });

  }
};


// ==========================================
// GET ALL COMMENTS
// ==========================================

export const getallcomment =
  async (req, res) => {

    const {
      videoid,
    } = req.params;

    try {

      const comments =
        await comment
          .find({
            videoid:
              videoid,

            moderationStatus:
              "visible",
          })
          .sort({
            createdAt:
              -1,
          });

      return res
        .status(200)
        .json(comments);

    } catch (error) {

      console.error(
        "Get comments error:",
        error
      );

      return res.status(500).json({
        message:
          "Something went wrong",
      });

    }
  };


// ==========================================
// DELETE COMMENT
// ==========================================

export const deletecomment =
  async (req, res) => {

    const {
      id: _id,
    } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        _id
      )
    ) {

      return res.status(404).json({
        message:
          "Comment unavailable",
      });

    }

    try {

      const deletedComment =
        await comment.findByIdAndDelete(
          _id
        );

      if (!deletedComment) {

        return res.status(404).json({
          message:
            "Comment not found",
        });

      }

      return res.status(200).json({
        comment: true,
      });

    } catch (error) {

      console.error(
        "Delete comment error:",
        error
      );

      return res.status(500).json({
        message:
          "Something went wrong",
      });

    }
  };


// ==========================================
// EDIT COMMENT
// ==========================================

export const editcomment =
  async (req, res) => {

    const {
      id: _id,
    } = req.params;

    const {
      commentbody,
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(
        _id
      )
    ) {

      return res.status(404).json({
        message:
          "Comment unavailable",
      });

    }

    try {

      const updatedComment =
        await comment.findByIdAndUpdate(
          _id,
          {
            $set: {
              commentbody:
                commentbody,
            },
          },
          {
            returnDocument: "after",
          }
        );

      return res.status(200).json(
        updatedComment
      );

    } catch (error) {

      console.error(
        "Edit comment error:",
        error
      );

      return res.status(500).json({
        message:
          "Something went wrong",
      });

    }
  };


// ==========================================
// LIKE COMMENT
// ==========================================

export const likeComment =
  async (req, res) => {

    const {
      id,
    } = req.params;

    const {
      userid,
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {

      return res.status(404).json({
        message:
          "Comment not found",
      });

    }

    try {

      const existingComment =
        await comment.findById(id);

      if (!existingComment) {

        return res.status(404).json({
          message:
            "Comment not found",
        });

      }


      // Check if already liked

      const alreadyLiked =
        existingComment.likes.some(
          userId =>
            userId.toString() ===
            userid
        );


      if (alreadyLiked) {

        // Remove like

        existingComment.likes =
          existingComment.likes.filter(
            userId =>
              userId.toString() !==
              userid
          );

      } else {

        // Add like

        existingComment.likes.push(
          userid
        );


        // Remove dislike

        existingComment.dislikes =
          existingComment.dislikes.filter(
            userId =>
              userId.toString() !==
              userid
          );

      }


      await existingComment.save();


      return res.status(200).json({

        likes:
          existingComment
            .likes.length,

        dislikes:
          existingComment
            .dislikes.length,

      });

    } catch (error) {

      console.error(
        "Like comment error:",
        error
      );

      return res.status(500).json({
        message:
          "Something went wrong",
      });

    }
  };


// ==========================================
// DISLIKE COMMENT
// ==========================================

export const dislikeComment =
  async (req, res) => {

    const {
      id,
    } = req.params;

    const {
      userid,
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {

      return res.status(404).json({
        message:
          "Comment not found",
      });

    }

    try {

      const existingComment =
        await comment.findById(id);

      if (!existingComment) {

        return res.status(404).json({
          message:
            "Comment not found",
        });

      }


      const alreadyDisliked =
        existingComment.dislikes.some(
          userId =>
            userId.toString() ===
            userid
        );


      if (
        alreadyDisliked
      ) {

        existingComment.dislikes =
          existingComment.dislikes.filter(
            userId =>
              userId.toString() !==
              userid
          );

      } else {

        existingComment.dislikes.push(
          userid
        );


        // Remove like

        existingComment.likes =
          existingComment.likes.filter(
            userId =>
              userId.toString() !==
              userid
          );

      }


      await existingComment.save();


      return res.status(200).json({

        likes:
          existingComment
            .likes.length,

        dislikes:
          existingComment
            .dislikes.length,

      });

    } catch (error) {

      console.error(
        "Dislike comment error:",
        error
      );

      return res.status(500).json({
        message:
          "Something went wrong",
      });

    }
  };


// ==========================================
// REPORT COMMENT
// ==========================================

export const reportComment =
  async (req, res) => {

    const {
      id,
    } = req.params;

    const {
      userid,
      reason,
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {

      return res.status(404).json({
        message:
          "Comment not found",
      });

    }

    try {

      const existingComment =
        await comment.findById(id);

      if (!existingComment) {

        return res.status(404).json({
          message:
            "Comment not found",
        });

      }


      // Prevent duplicate report

      const alreadyReported =
        existingComment.reports.some(
          report =>
            report.userid &&
            report.userid.toString() ===
              userid
        );


      if (
        alreadyReported
      ) {

        return res.status(400).json({
          message:
            "You already reported this comment",
        });

      }


      existingComment.reports.push({
        userid,
        reason,
      });


      // Flag for moderation

      existingComment.moderationStatus =
        "flagged";


      await existingComment.save();


      return res.status(200).json({

        message:
          "Comment reported successfully",

        reportCount:
          existingComment
            .reports.length,

      });

    } catch (error) {

      console.error(
        "Report comment error:",
        error
      );

      return res.status(500).json({
        message:
          "Something went wrong",
      });

    }
  };