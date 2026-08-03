import Download from "../Modals/Download.js";
import User from "../Modals/Auth.js";
import Video from "../Modals/video.js";
import { PLANS } from "../config/plans.js";

const normalizePlan = (plan) => (plan && PLANS[plan] ? plan : "Free");

const getActivePlan = (user) => {
  const plan = normalizePlan(user?.plan);

  if (user?.subscriptionEndDate && new Date(user.subscriptionEndDate) < new Date()) {
    return "Free";
  }

  return plan;
};

// ==============================
// START VIDEO DOWNLOAD
// ==============================
export const downloadVideo = async (req, res) => {
  try {
    const { userId, videoId } = req.body;

    // Check required data
    if (!userId || !videoId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Video ID are required",
      });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find video
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // Get user's subscription plan
    const userPlan = getActivePlan(user);

    // Check premium access for premium videos
    const planAccess = PLANS[userPlan] || PLANS.Free;

    if (video.premiumVideo && !planAccess.premiumVideos) {
      return res.status(403).json({
        success: false,
        message: `This video requires a paid plan. Upgrade to ${userPlan === "Free" ? "Bronze" : userPlan} to download premium content.`,
        plan: userPlan,
      });
    }

    // Get download limit
    const limit = planAccess.downloadsPerDay;

    // Get start of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Count today's downloads
    const todayDownloads = await Download.countDocuments({
      userId: userId,
      downloadedAt: {
        $gte: startOfDay,
      },
    });

    // Check daily limit
    if (todayDownloads >= limit) {
      return res.status(403).json({
        success: false,
        message: `Daily download limit reached. Your ${userPlan} plan allows ${limit} download(s) per day.`,
        plan: userPlan,
        limit: limit,
        used: todayDownloads,
        remaining: 0,
      });
    }

    // Save download record
    const download = await Download.create({
      userId: userId,
      videoId: videoId,
      userPlan: userPlan,
      videoTitle: video.videotitle,
      videoFile: video.filepath,
    });

    // Get backend URL
    const backendUrl =
      process.env.BACKEND_URL ||
      "http://localhost:5000";

    // Make sure filepath does not start with /
    const cleanFilePath = video.filepath.replace(/^\/+/, "");

    // Create download URL
    const downloadUrl =
      `${backendUrl}/${cleanFilePath}`;

    return res.status(200).json({
      success: true,
      message: "Download started",

      downloadUrl: downloadUrl,

      download: download,

      plan: userPlan,

      limit: limit,

      used: todayDownloads + 1,

      remaining:
        limit - (todayDownloads + 1),
    });

  } catch (error) {
    console.error(
      "Download error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while downloading video",
    });
  }
};

// ==============================
// GET USER DOWNLOADS
// ==============================
export const getUserDownloads = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    const downloads =
      await Download.find({
        userId: userId,
      }).sort({
        downloadedAt: -1,
      });

    return res.status(200).json({
      success: true,
      downloads: downloads,
    });

  } catch (error) {
    console.error(
      "Get downloads error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch downloads",
    });
  }
};