"use client";

import { User } from "lucide-react";

interface Participant {
  userId: string;
  username: string;
  socketId: string;
}

interface Props {
  participants: Participant[];
}

export default function WatchPartyParticipants({
  participants,
}: Props) {
  if (participants.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No other participants yet.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {participants.map(
        (participant) => (
          <div
            key={
              participant.socketId
            }
            className="flex items-center gap-3 rounded-lg bg-zinc-900 px-4 py-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-700">
              <User size={18} />
            </div>

            <div>
              <p className="text-sm font-medium">
                {
                  participant.username
                }
              </p>

              <p className="text-xs text-green-500">
                Online
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
}