"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  UsersRound,
  Loader2,
} from "lucide-react";

import axios from "axios";

interface Props {
  videoId: string;
  userId: string;
  username?: string;
}

export default function CreateWatchPartyButton({
  videoId,
  userId,
  username,
}: Props) {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const createWatchParty =
    async () => {
      try {
        setLoading(true);
        setError("");

        const backendUrl =
          process.env
            .NEXT_PUBLIC_BACKEND_URL ||
          "http://localhost:5000";

        const response =
          await axios.post(
            `${backendUrl}/watchparty/create`,
            {
              videoId,
              hostId: userId,
              username,
            }
          );

        const roomId =
          response.data.roomId;

        if (!roomId) {
          throw new Error(
            "Room ID was not returned"
          );
        }

        // Redirect to Watch Party
        router.push(
          `/watch-party/${roomId}`
        );
      } catch (error: any) {
        console.error(
          "Create Watch Party Error:",
          error
        );

        setError(
          error?.response?.data
            ?.message ||
            "Failed to create Watch Party"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div>
      <button
        onClick={
          createWatchParty
        }
        disabled={loading}
        className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <Loader2
            size={18}
            className="animate-spin"
          />
        ) : (
          <UsersRound
            size={18}
          />
        )}

        {loading
          ? "Creating..."
          : "Watch Party"}
      </button>

      {error && (
        <p className="mt-2 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}