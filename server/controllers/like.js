import mongoose from "mongoose";
import like from "../Modals/like.js";
import video from "../Modals/video.js";

export const handlelike = async (req, res) => {
  const { userId } = req.body;
  const { videoId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(videoId)
  ) {
    return res.status(400).json({ message: "Invalid userId or videoId" });
  }

  try {
    const existingLike = await like.findOne({
      viewer: userId,
      videoid: videoId,
    });
    if (existingLike) {
      await like.findByIdAndDelete(existingLike._id);
      await video.findByIdAndUpdate(videoId, { $inc: { Like: -1 } });
      return res.status(200).json({ message: "like removed", liked: false });
    } else {
      await like.create({ viewer: userId, videoid: videoId });
      await video.findByIdAndUpdate(videoId, { $inc: { Like: 1 } });
      return res.status(200).json({ message: "liked", liked: true });
    }
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getallLikedVideo = async (req, res) => {
  const { userId } = req.params;
  try {
    const likevideo = await like
      .find({ viewer: userId })
      .populate({
        path: "videoid",
        model: "videofiles",
      })
      .exec();
    return res.status(200).json(likevideo);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};