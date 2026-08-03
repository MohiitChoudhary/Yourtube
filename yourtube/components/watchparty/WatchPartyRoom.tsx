"use client";

import {
  useEffect,
  useState,
} from "react";

import { socket } from "@/lib/socket";

import WatchPartyVideo from "@/components/watchparty/WatchPartyVideo";
import WatchPartyChat from "@/components/watchparty/WatchPartyChat";
import WatchPartyParticipants from "@/components/watchparty/WatchPartyParticipants";

import {
  Users,
  MessageCircle,
  LogOut,
} from "lucide-react";

interface WatchPartyRoomProps {
  roomId: string;
}

interface Participant {
  userId: string;
  username: string;
  socketId: string;
}

export default function WatchPartyRoom({
  roomId,
}: WatchPartyRoomProps) {
  const [participants, setParticipants] =
    useState<Participant[]>([]);

  const [showChat, setShowChat] =
    useState(true);

  const [userId, setUserId] =
    useState("");

  const [username, setUsername] =
    useState("");

  useEffect(() => {
    let storedUserId =
      localStorage.getItem(
        "yourtube-user-id"
      );

    let storedUsername =
      localStorage.getItem(
        "yourtube-username"
      );

    if (!storedUserId) {
      storedUserId =
        crypto.randomUUID();

      localStorage.setItem(
        "yourtube-user-id",
        storedUserId
      );
    }

    if (!storedUsername) {
      storedUsername = "Guest";

      localStorage.setItem(
        "yourtube-username",
        storedUsername
      );
    }

    setUserId(storedUserId);
    setUsername(storedUsername);

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit(
      "join-watch-party",
      {
        roomId,
        userId: storedUserId,
        username: storedUsername,
      }
    );

    const handleUserJoined = (
      participant: Participant
    ) => {
      setParticipants(
        (previous) => {
          const exists =
            previous.some(
              (user) =>
                user.socketId ===
                participant.socketId
            );

          if (exists) {
            return previous;
          }

          return [
            ...previous,
            participant,
          ];
        }
      );
    };

    const handleUserLeft = ({
      socketId,
    }: {
      socketId: string;
    }) => {
      setParticipants(
        (previous) =>
          previous.filter(
            (user) =>
              user.socketId !==
              socketId
          )
      );
    };

    socket.on(
      "user-joined-watch-party",
      handleUserJoined
    );

    socket.on(
      "user-left-watch-party",
      handleUserLeft
    );

    return () => {
      socket.emit(
        "leave-watch-party",
        {
          roomId,
          userId: storedUserId,
          username: storedUsername,
        }
      );

      socket.off(
        "user-joined-watch-party",
        handleUserJoined
      );

      socket.off(
        "user-left-watch-party",
        handleUserLeft
      );
    };
  }, [roomId]);

  const leaveParty = () => {
    socket.emit(
      "leave-watch-party",
      {
        roomId,
        userId,
        username,
      }
    );

    socket.disconnect();

    window.location.href = "/";
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HEADER */}

      <header className="h-16 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-6">
        <div>
          <h1 className="text-xl font-semibold">
            YourTube Watch Party
          </h1>

          <p className="text-xs text-zinc-400">
            Room ID: {roomId}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              setShowChat(
                !showChat
              )
            }
            className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700"
          >
            <MessageCircle size={18} />

            Chat
          </button>

          <button
            onClick={leaveParty}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm hover:bg-red-700"
          >
            <LogOut size={18} />

            Leave
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}

      <div className="flex min-h-[calc(100vh-64px)]">
        {/* VIDEO SECTION */}

        <section className="flex-1 p-6">
          <div className="mx-auto max-w-6xl">
            <WatchPartyVideo
              roomId={roomId}
            />

            {/* VIDEO INFORMATION */}

            <div className="mt-5">
              <h2 className="text-xl font-semibold">
                Watch Party
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                Watch videos together
                with your friends in
                real time.
              </p>
            </div>

            {/* PARTICIPANTS */}

            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Users size={20} />

                <h3 className="font-semibold">
                  Participants
                </h3>
              </div>

              <WatchPartyParticipants
                participants={
                  participants
                }
              />
            </div>
          </div>
        </section>

        {/* CHAT */}

        {showChat && (
          <aside className="hidden w-[360px] border-l border-zinc-800 bg-zinc-950 lg:flex">
            <WatchPartyChat
              roomId={roomId}
              userId={userId}
              username={username}
            />
          </aside>
        )}
      </div>
    </main>
  );
}