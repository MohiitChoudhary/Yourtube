"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  Send,
  MessageCircle,
} from "lucide-react";

import { socket } from "@/lib/socket";

interface Message {
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

interface Props {
  roomId: string;
  userId: string;
  username: string;
}

export default function WatchPartyChat({
  roomId,
  userId,
  username,
}: Props) {
  const [messages, setMessages] =
    useState<Message[]>([]);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    const handleMessage = (
      newMessage: Message
    ) => {
      setMessages(
        (previous) => [
          ...previous,
          newMessage,
        ]
      );
    };

    socket.on(
      "chat-message",
      handleMessage
    );

    return () => {
      socket.off(
        "chat-message",
        handleMessage
      );
    };
  }, []);

  const sendMessage = (
    event: FormEvent
  ) => {
    event.preventDefault();

    const trimmedMessage =
      message.trim();

    if (!trimmedMessage) {
      return;
    }

    socket.emit(
      "chat-message",
      {
        roomId,
        userId,
        username,
        message:
          trimmedMessage,
      }
    );

    setMessage("");
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* CHAT HEADER */}

      <div className="flex items-center gap-3 border-b border-zinc-800 p-5">
        <MessageCircle size={20} />

        <div>
          <h2 className="font-semibold">
            Live Chat
          </h2>

          <p className="text-xs text-zinc-500">
            Talk with your party
          </p>
        </div>
      </div>

      {/* MESSAGES */}

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-zinc-500">
            <MessageCircle
              size={36}
              className="mb-3 opacity-50"
            />

            <p className="text-sm">
              No messages yet
            </p>

            <p className="mt-1 text-xs">
              Start the conversation
            </p>
          </div>
        )}

        {messages.map(
          (item, index) => {
            const isOwnMessage =
              item.userId === userId;

            return (
              <div
                key={`${item.timestamp}-${index}`}
                className={
                  isOwnMessage
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <div
                  className={
                    isOwnMessage
                      ? "max-w-[85%]"
                      : "max-w-[85%]"
                  }
                >
                  {!isOwnMessage && (
                    <p className="mb-1 text-xs font-medium text-zinc-400">
                      {
                        item.username
                      }
                    </p>
                  )}

                  <div
                    className={
                      isOwnMessage
                        ? "rounded-2xl rounded-br-sm bg-red-600 px-4 py-2 text-sm"
                        : "rounded-2xl rounded-bl-sm bg-zinc-800 px-4 py-2 text-sm"
                    }
                  >
                    {
                      item.message
                    }
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* MESSAGE INPUT */}

      <form
        onSubmit={sendMessage}
        className="border-t border-zinc-800 p-4"
      >
        <div className="flex items-center gap-2 rounded-xl bg-zinc-900 p-2">
          <input
            value={message}
            onChange={(event) =>
              setMessage(
                event.target.value
              )
            }
            placeholder="Type a message..."
            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-zinc-500"
          />

          <button
            type="submit"
            disabled={
              !message.trim()
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={17} />
          </button>
        </div>
      </form>
    </div>
  );
}