"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
Clock,
Download,
MoreHorizontal,
Share,
ThumbsDown,
ThumbsUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

const VideoInfo = ({ video, isPremiumBlocked = false, canAccessPremium = false }: any) => {
const [likes, setLikes] = useState(video?.Like || 0);
const [dislikes, setDislikes] = useState(video?.Dislike || 0);
const [isLiked, setIsLiked] = useState(false);
const [isDisliked, setIsDisliked] = useState(false);
const [showFullDescription, setShowFullDescription] = useState(false);
const [isWatchLater, setIsWatchLater] = useState(false);
const [isDownloading, setIsDownloading] = useState(false);

const { user } = useUser();

useEffect(() => {
if (!video) return;


setLikes(video?.Like || 0);
setDislikes(video?.Dislike || 0);
setIsLiked(false);
setIsDisliked(false);


}, [video]);

useEffect(() => {
if (!video?._id) return;


const handleViews = async () => {
  try {
    if (user) {
      await axiosInstance.post(`/history/${video._id}`, {
        userId: user._id,
      });
    } else {
      await axiosInstance.post(`/history/views/${video._id}`);
    }
  } catch (error) {
    console.log("History error:", error);
  }
};

handleViews();


}, [user, video?._id]);

const handleLike = async () => {
if (!user) {
alert("Please sign in to like this video.");
return;
}


try {
  const res = await axiosInstance.post(`/like/${video._id}`, {
    userId: user._id,
  });

  if (res.data.message === "liked") {
    setLikes((prev: number) => prev + 1);
    setIsLiked(true);

    if (isDisliked) {
      setDislikes((prev: number) => Math.max(0, prev - 1));
      setIsDisliked(false);
    }
  }

  if (res.data.message === "like removed") {
    setLikes((prev: number) => Math.max(0, prev - 1));
    setIsLiked(false);
  }
} catch (error) {
  console.log("Like error:", error);
}


};

const handleDislike = async () => {
if (!user) {
alert("Please sign in to dislike this video.");
return;
}


try {
  const res = await axiosInstance.post(`/like/${video._id}`, {
    userId: user._id,
  });

  if (res.data.message === "liked") {
    if (isDisliked) {
      setDislikes((prev: number) => Math.max(0, prev - 1));
      setIsDisliked(false);
    } else {
      setDislikes((prev: number) => prev + 1);
      setIsDisliked(true);

      if (isLiked) {
        setLikes((prev: number) => Math.max(0, prev - 1));
        setIsLiked(false);
      }
    }
  }

  if (res.data.message === "like removed") {
    setDislikes((prev: number) => Math.max(0, prev - 1));
    setIsDisliked(false);
  }
} catch (error) {
  console.log("Dislike error:", error);
}


};

const handleWatchLater = async () => {
if (!user) {
alert("Please sign in to use Watch Later.");
return;
}


try {
  const res = await axiosInstance.post(`/watch/${video._id}`, {
    userId: user._id,
  });

  setIsWatchLater(!!res.data.watchlater);
} catch (error) {
  console.log("Watch Later error:", error);
}


};

const handleShare = async () => {
try {
const shareUrl = window.location.href;


  if (navigator.share) {
    await navigator.share({
      title: video.videotitle,
      text: `Watch ${video.videotitle} on YourTube`,
      url: shareUrl,
    });
  } else {
    await navigator.clipboard.writeText(shareUrl);
    alert("Video link copied to clipboard!");
  }
} catch (error) {
  console.log("Share error:", error);
}


};

const handleDownload = async () => {
if (!user) {
alert("Please sign in to download videos.");
return;
}

if (isPremiumBlocked) {
  alert("This premium video requires an active paid plan to download.");
  return;
}

if (!video?._id) {
  alert("Video information is missing.");
  return;
}

try {
  setIsDownloading(true);

  const res = await axiosInstance.post("/download", {
    userId: user._id,
    videoId: video._id,
  });

  if (!res.data?.success) {
    alert(res.data?.message || "Download is not available.");
    return;
  }

  const downloadUrl = res.data?.downloadUrl;

  if (!downloadUrl) {
    alert("Download URL was not provided by the server.");
    return;
  }

  const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");
  const normalizedUrl = downloadUrl.startsWith("http") ? downloadUrl : `${backendBase}/${downloadUrl.replace(/^\/+/, "")}`;

  const link = document.createElement("a");

  link.href = normalizedUrl;
  link.download = video.filename || "yourtube-video.mp4";
  link.target = "_self";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  const remaining = res.data?.remaining;

  if (remaining !== undefined) {
    alert(
      `Download started. You have ${remaining} download(s) remaining today.`
    );
  } else {
    alert("Download started.");
  }
} catch (error: any) {
  console.error("Download error:", error);

  if (error?.response?.status === 403) {
    alert(
      error?.response?.data?.message ||
        "Daily download limit reached."
    );
    return;
  }

  if (error?.response?.status === 404) {
    alert(
      error?.response?.data?.message ||
        "User or video not found."
    );
    return;
  }

  alert(
    error?.response?.data?.message ||
      "Unable to download video. Please try again."
  );
} finally {
  setIsDownloading(false);
}


};

const channelName =
video?.videochanel || "YourTube Channel";

const videoTitle =
video?.videotitle || "Untitled Video";

const views = video?.views || 0;

const description =
video?.description ||
"No description available for this video.";

return ( <div className="space-y-4 text-gray-900 dark:text-white"> <h1 className="text-xl font-semibold">
{videoTitle} </h1>


  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
    <div className="flex items-center gap-4">
      <Avatar className="h-10 w-10">
        <AvatarFallback>
          {channelName[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div>
        <h3 className="font-medium">
          {channelName}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          1.2M subscribers
        </p>
      </div>

      <Button className="ml-2">
        Subscribe
      </Button>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center rounded-full bg-gray-100 dark:bg-gray-800">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-l-full text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700"
          onClick={handleLike}
        >
          <ThumbsUp
            className={`mr-2 h-5 w-5 ${
              isLiked ? "fill-current" : ""
            }`}
          />

          {likes.toLocaleString()}
        </Button>

        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

        <Button
          variant="ghost"
          size="sm"
          className="rounded-r-full text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700"
          onClick={handleDislike}
        >
          <ThumbsDown
            className={`mr-2 h-5 w-5 ${
              isDisliked ? "fill-current" : ""
            }`}
          />

          {dislikes.toLocaleString()}
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className={`rounded-full bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 ${
          isWatchLater
            ? "text-blue-600 dark:text-blue-400"
            : ""
        }`}
        onClick={handleWatchLater}
      >
        <Clock className="mr-2 h-5 w-5" />

        {isWatchLater ? "Saved" : "Watch Later"}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="rounded-full bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
        onClick={handleShare}
      >
        <Share className="mr-2 h-5 w-5" />
        Share
      </Button>

      <Button
        variant="ghost"
        size="sm"
        disabled={isDownloading || isPremiumBlocked}
        className="rounded-full bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 disabled:opacity-50"
        onClick={handleDownload}
      >
        <Download className="mr-2 h-5 w-5" />

        {isDownloading
          ? "Downloading..."
          : "Download"}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="rounded-full bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
      >
        <MoreHorizontal className="h-5 w-5" />
      </Button>
    </div>
  </div>

  <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
    <div className="mb-2 flex gap-4 text-sm font-medium">
      <span>
        {views.toLocaleString()} views
      </span>

      {video?.createdAt && (
        <span>
          {formatDistanceToNow(
            new Date(video.createdAt)
          )}{" "}
          ago
        </span>
      )}
    </div>

    <div
      className={`text-sm leading-6 ${
        showFullDescription ? "" : "line-clamp-3"
      }`}
    >
      <p>{description}</p>
    </div>

    <Button
      variant="ghost"
      size="sm"
      className="mt-2 h-auto p-0 font-medium text-gray-900 hover:bg-transparent dark:text-white"
      onClick={() =>
        setShowFullDescription(
          !showFullDescription
        )
      }
    >
      {showFullDescription
        ? "Show less"
        : "Show more"}
    </Button>
  </div>
</div>


);
};

export default VideoInfo;
