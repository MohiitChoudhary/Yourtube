import Link from "next/link";

const timeAgo = (date: string | number) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

interface RelatedVideosProps {
  videos: Array<{
    _id: string;
    videotitle: string;
    videochanel: string;
    views: number;
    createdAt: string;
  }>;
}
const vid = "/video/vdo.mp4";
export default function RelatedVideos({ videos }: RelatedVideosProps) {
  return (
    <div className="space-y-2">
      {videos.map((video) => (
        <Link
          key={video._id}
          href={`/watch/${video._id}`}
          className="flex gap-2 group"
        >
          <div className="relative w-40 aspect-video bg-gray-100 rounded overflow-hidden flex-shrink-0">
            <video
              src={vid}
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
              {video.videotitle}
            </h3>
            <p className="text-xs text-gray-600 mt-1">{video.videochanel}</p>
            <p className="text-xs text-gray-600">
              {video.views.toLocaleString()} views • {timeAgo(video.createdAt)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}