"use client";

import {
  useEffect,
  useRef,
} from "react";

import { socket } from "@/lib/socket";

interface WatchPartyVideoProps {
  roomId: string;
}

export default function WatchPartyVideo({
  roomId,
}: WatchPartyVideoProps) {
  const videoRef =
    useRef<HTMLVideoElement>(null);

  const isRemoteAction =
    useRef(false);

  useEffect(() => {
    const video =
      videoRef.current;

    if (!video) return;

    const handlePlay = () => {
      if (isRemoteAction.current) {
        isRemoteAction.current =
          false;

        return;
      }

      socket.emit(
        "video-play",
        {
          roomId,
          currentTime:
            video.currentTime,
        }
      );
    };

    const handlePause = () => {
      if (isRemoteAction.current) {
        isRemoteAction.current =
          false;

        return;
      }

      socket.emit(
        "video-pause",
        {
          roomId,
          currentTime:
            video.currentTime,
        }
      );
    };

    const handleSeek = () => {
      if (isRemoteAction.current) {
        return;
      }

      socket.emit(
        "video-seek",
        {
          roomId,
          currentTime:
            video.currentTime,
        }
      );
    };

    video.addEventListener(
      "play",
      handlePlay
    );

    video.addEventListener(
      "pause",
      handlePause
    );

    video.addEventListener(
      "seeked",
      handleSeek
    );

    const handleRemotePlay = ({
      currentTime,
    }: {
      currentTime: number;
    }) => {
      isRemoteAction.current =
        true;

      video.currentTime =
        currentTime;

      video.play().catch(() => {});
    };

    const handleRemotePause = ({
      currentTime,
    }: {
      currentTime: number;
    }) => {
      isRemoteAction.current =
        true;

      video.currentTime =
        currentTime;

      video.pause();
    };

    const handleRemoteSeek = ({
      currentTime,
    }: {
      currentTime: number;
    }) => {
      isRemoteAction.current =
        true;

      video.currentTime =
        currentTime;

      setTimeout(() => {
        isRemoteAction.current =
          false;
      }, 100);
    };

    socket.on(
      "video-play",
      handleRemotePlay
    );

    socket.on(
      "video-pause",
      handleRemotePause
    );

    socket.on(
      "video-seek",
      handleRemoteSeek
    );

    return () => {
      video.removeEventListener(
        "play",
        handlePlay
      );

      video.removeEventListener(
        "pause",
        handlePause
      );

      video.removeEventListener(
        "seeked",
        handleSeek
      );

      socket.off(
        "video-play",
        handleRemotePlay
      );

      socket.off(
        "video-pause",
        handleRemotePause
      );

      socket.off(
        "video-seek",
        handleRemoteSeek
      );
    };
  }, [roomId]);

  return (
    <div className="overflow-hidden rounded-xl bg-black shadow-2xl">
      <div className="aspect-video w-full">
        <video
          ref={videoRef}
          className="h-full w-full object-contain"
          controls
          playsInline
          preload="metadata"
          poster="/placeholder.svg"
        >
          <source
            src="/sample-video.mp4"
            type="video/mp4"
          />

          Your browser does not
          support video playback.
        </video>
      </div>
    </div>
  );
}