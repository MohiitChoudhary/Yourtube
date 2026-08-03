"use client";

import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    filepath: string;
    premiumVideo?: boolean;
  };
  isPremiumBlocked?: boolean;
}

export default function VideoPlayer({
  video,
  isPremiumBlocked = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);

  const videoUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.filepath}`;

  // Play / Pause
  const togglePlay = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  // Time update
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    setCurrentTime(videoRef.current.currentTime);
  };

  // Metadata loaded
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;

    setDuration(videoRef.current.duration);
    setIsLoading(false);
  };

  // Seek
  const handleSeek = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!videoRef.current) return;

    const newTime = Number(e.target.value);

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Volume
  const handleVolume = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!videoRef.current) return;

    const newVolume = Number(e.target.value);

    videoRef.current.volume = newVolume;

    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // Mute
  const toggleMute = () => {
    if (!videoRef.current) return;

    videoRef.current.muted = !videoRef.current.muted;

    setIsMuted(videoRef.current.muted);
  };

  // Skip
  const skip = (seconds: number) => {
    if (!videoRef.current) return;

    const newTime =
      videoRef.current.currentTime + seconds;

    videoRef.current.currentTime = Math.max(
      0,
      Math.min(
        newTime,
        videoRef.current.duration || 0
      )
    );
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  // Playback speed
  const handlePlaybackRate = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (!videoRef.current) return;

    const speed = Number(e.target.value);

    videoRef.current.playbackRate = speed;
    setPlaybackRate(speed);
  };

  // Format time
  const formatTime = (time: number) => {
    if (!time || isNaN(time)) {
      return "0:00";
    }

    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }

    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Double click
  const handleDoubleClick = (
    e: React.MouseEvent<HTMLVideoElement>
  ) => {
    if (!videoRef.current) return;

    const rect =
      videoRef.current.getBoundingClientRect();

    const clickPosition =
      e.clientX - rect.left;

    if (clickPosition < rect.width / 2) {
      skip(-10);
    } else {
      skip(10);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (
      e: KeyboardEvent
    ) => {
      if (!videoRef.current) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;

        case "ArrowLeft":
          skip(-10);
          break;

        case "ArrowRight":
          skip(10);
          break;

        case "m":
        case "M":
          toggleMute();
          break;

        case "f":
        case "F":
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  return (
    <div className="group relative w-full overflow-hidden rounded-lg bg-black shadow-lg">

      {/* Video */}

      <div className="relative aspect-video bg-black">

        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
          </div>
        )}

        {isPremiumBlocked ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 px-6 text-center">
            <div className="max-w-md rounded-lg border border-amber-400/40 bg-amber-950/70 p-6 text-white">
              <p className="text-lg font-semibold">Premium content</p>
              <p className="mt-2 text-sm text-amber-100">
                This video is locked to paid members. Upgrade your plan to watch it.
              </p>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="h-full w-full cursor-pointer object-contain"
            onClick={togglePlay}
            onDoubleClick={handleDoubleClick}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => setIsLoading(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source
              src={videoUrl}
              type="video/mp4"
            />

            Your browser does not support the video tag.
          </video>
        )}

      </div>

      {/* Controls */}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 pb-3 pt-10 opacity-100 transition-opacity">

        {/* Progress */}

        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="mb-3 h-1 w-full cursor-pointer accent-red-600"
        />

        <div className="flex items-center gap-3 text-white">

          {/* Play */}

          <button
            onClick={togglePlay}
            className="hover:text-gray-300"
            aria-label={
              isPlaying
                ? "Pause"
                : "Play"
            }
          >
            {isPlaying ? (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            )}
          </button>

          {/* Rewind */}

          <button
            onClick={() => skip(-10)}
            className="hover:text-gray-300"
            aria-label="Rewind 10 seconds"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 14L4 9l5-5" />
              <path d="M4 9h9a6 6 0 1 1-5.2 9" />
              <text
                x="10"
                y="13"
                fontSize="5"
                fill="currentColor"
                stroke="none"
              >
                10
              </text>
            </svg>
          </button>

          {/* Forward */}

          <button
            onClick={() => skip(10)}
            className="hover:text-gray-300"
            aria-label="Forward 10 seconds"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 14l5-5-5-5" />
              <path d="M20 9h-9a6 6 0 1 0 5.2 9" />
              <text
                x="9"
                y="13"
                fontSize="5"
                fill="currentColor"
                stroke="none"
              >
                10
              </text>
            </svg>
          </button>

          {/* Volume */}

          <button
            onClick={toggleMute}
            className="hover:text-gray-300"
            aria-label="Mute"
          >
            {isMuted || volume === 0 ? (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M4 9v6h4l5 4V5L8 9H4z" />
                <path
                  d="M17 9l4 4m0-4l-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M4 9v6h4l5 4V5L8 9H4z" />
                <path
                  d="M16 8c1.5 2 1.5 6 0 8M19 5c3 4 3 10 0 14"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            )}
          </button>

          {/* Volume slider */}

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={
              isMuted
                ? 0
                : volume
            }
            onChange={handleVolume}
            className="hidden w-20 cursor-pointer sm:block"
            aria-label="Volume"
          />

          {/* Time */}

          <span className="text-xs font-medium">
            {formatTime(currentTime)}
            {" / "}
            {formatTime(duration)}
          </span>

          {/* Spacer */}

          <div className="flex-1" />

          {/* Speed */}

          <select
            value={playbackRate}
            onChange={handlePlaybackRate}
            className="hidden bg-transparent text-xs outline-none sm:block"
            aria-label="Playback speed"
          >
            <option
              value="0.5"
              className="bg-black"
            >
              0.5x
            </option>

            <option
              value="0.75"
              className="bg-black"
            >
              0.75x
            </option>

            <option
              value="1"
              className="bg-black"
            >
              Normal
            </option>

            <option
              value="1.25"
              className="bg-black"
            >
              1.25x
            </option>

            <option
              value="1.5"
              className="bg-black"
            >
              1.5x
            </option>

            <option
              value="2"
              className="bg-black"
            >
              2x
            </option>
          </select>

          {/* Fullscreen */}

          <button
            onClick={toggleFullscreen}
            className="hover:text-gray-300"
            aria-label="Fullscreen"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3" />
              <path d="M16 3h3a2 2 0 0 1 2 2v3" />
              <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
              <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
          </button>

        </div>

      </div>

    </div>
  );
}