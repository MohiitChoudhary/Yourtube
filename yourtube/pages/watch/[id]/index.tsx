
import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideos";
import VideoInfo from "@/components/VideoInfo";
import Videopplayer from "@/components/Videopplayer";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { getUserSubscriptionAccess } from "@/lib/subscriptionAccess";
import { useRouter } from "next/router";
import React, {
  useEffect,
  useState,
} from "react";

const Index = () => {
  const router = useRouter();

  const { id } = router.query;

  const [videos, setVideo] =
    useState<any>(null);

  const [video, setVideos] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);
  const { user } = useUser();
  const [subscriptionAccess, setSubscriptionAccess] = useState<any>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      // Wait until router is ready
      if (!router.isReady) {
        return;
      }

      // Make sure ID exists
      if (
        !id ||
        typeof id !== "string"
      ) {
        setLoading(false);
        return;
      }

      try {
        const res =
          await axiosInstance.get(
            "/video/getall"
          );

        if (user?._id) {
          const access = await getUserSubscriptionAccess(user._id);
          setSubscriptionAccess(access);
        } else {
          setSubscriptionAccess({ plan: "Free", planAccess: { premiumVideos: false, adFree: false, downloadsPerDay: 1 } });
        }

        // Find selected video
        const selectedVideo =
          res.data?.find(
            (vid: any) =>
              vid._id === id
          );

        setVideo(selectedVideo);

        // Store all videos
        // for RelatedVideos
        setVideos(res.data);

      } catch (error) {
        console.error(
          "Error fetching video:",
          error
        );

        setVideo(null);

      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [router.isReady, id, user?._id]);


  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-900 dark:bg-gray-950 dark:text-white transition-colors">
        <div className="text-lg">
          Loading...
        </div>
      </div>
    );
  }


  // Video not found
  if (!videos) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-900 dark:bg-gray-950 dark:text-white transition-colors">
        <div className="text-lg">
          Video not found
        </div>
      </div>
    );
  }


  const isPremiumBlocked = Boolean(video?.premiumVideo) && subscriptionAccess?.planAccess?.premiumVideos !== true;

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 dark:bg-gray-950 dark:text-white transition-colors">
        {isPremiumBlocked && (
          <div className="mx-auto max-w-7xl px-4 pt-4">
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              This video requires a paid plan. Upgrade your subscription to unlock premium content.
            </div>
          </div>
        )}
      {/* Main Watch Page Container */}

      <div className="max-w-7xl mx-auto p-4">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ================================= */}
          {/* MAIN VIDEO SECTION */}
          {/* ================================= */}

          <div className="lg:col-span-2 space-y-4">

            {/* Video Player */}

            <Videopplayer
              video={videos}
              isPremiumBlocked={isPremiumBlocked}
            />


            {/* Video Information */}

            <VideoInfo
              video={videos}
              isPremiumBlocked={isPremiumBlocked}
              canAccessPremium={subscriptionAccess?.planAccess?.premiumVideos === true}
            />


            {/* Comments */}

            <Comments
              videoId={id}
            />

          </div>


          {/* ================================= */}
          {/* RELATED VIDEOS SECTION */}
          {/* ================================= */}

          <div className="space-y-4">

            <RelatedVideos
              videos={video}
            />

          </div>

        </div>

      </div>

    </div>
  );
};

export default Index;
