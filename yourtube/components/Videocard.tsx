"use client";
import Link from "next/link";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useEffect, useState } from "react";

const getTimeAgo = (createdAt?: string) => {
  if (!createdAt) return "";
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours`;
  const days = Math.floor(hours / 24);
  return `${days} days`;
};

export default function VideoCard({ video }: any) {
  const [timeAgo, setTimeAgo] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setTimeAgo(getTimeAgo(video?.createdAt));
    setIsHydrated(true);
  }, [video?.createdAt]);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
  const videoSrc = video?.filepath ? `${backendUrl}/${video.filepath}` : "";
  const channelInitial = typeof video?.videochanel === "string" && video.videochanel.length > 0 ? video.videochanel[0] : "";
  const formattedViews = typeof video?.views === "number" ? video.views.toLocaleString() : String(video?.views ?? 0);

  return (
    <Link href={`/watch/${video?._id}`} className="group">
      <div className="space-y-3">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
          <video
            src={videoSrc}
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">
            10:24
          </div>
        </div>
        <div className="flex gap-3">
          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarFallback>{channelInitial}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
              {video?.videotitle}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{video?.videochanel}</p>
            <p className="text-sm text-gray-600">
              {formattedViews} views • {timeAgo ? `${timeAgo} ago` : "Just now"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}