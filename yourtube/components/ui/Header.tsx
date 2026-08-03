"use client";

import {
Bell,
Menu,
Mic,
Search,
User,
VideoIcon,
Sun,
Moon,
UsersRound,
Loader2,
} from "lucide-react";

import React, {
useState,
} from "react";

import { Button } from "./button";

import Link from "next/link";

import { Input } from "./input";

import {
DropdownMenu,
DropdownMenuContent,
DropdownMenuItem,
DropdownMenuSeparator,
DropdownMenuTrigger,
} from "./dropdown-menu";

import {
Avatar,
AvatarFallback,
AvatarImage,
} from "./avatar";

import Channeldialogue from "../channeldialogue";

import { useRouter } from "next/navigation";

import { useUser } from "@/lib/AuthContext";

import { useTheme } from "./ThemeContext";

import axiosInstance from "@/lib/axiosinstance";

const Header = () => {
const {
user,
logout,
handlegooglesignin,
} = useUser();

const {
theme,
toggleTheme,
} = useTheme();

const [
searchQuery,
setSearchQuery,
] = useState("");

const [
isdialogeopen,
setisdialogeopen,
] = useState(false);

const [
isCreatingParty,
setIsCreatingParty,
] = useState(false);

const router = useRouter();

// ==========================================
// SEARCH
// ==========================================

const handleSearch = (
e: React.FormEvent
) => {
e.preventDefault();


if (searchQuery.trim()) {
  router.push(
    `/search?q=${encodeURIComponent(
      searchQuery.trim()
    )}`
  );
}


};

// ==========================================
// ENTER KEY SEARCH
// ==========================================

const handleKeypress = (
e: React.KeyboardEvent
) => {
if (e.key === "Enter") {
handleSearch(e);
}
};

// ==========================================
// LOGOUT
// ==========================================

const handleLogout =
async () => {
try {
logout();


    router.push("/");
  } catch (error) {
    console.error(
      "Logout error:",
      error
    );
  }
};


// ==========================================
// WATCH PARTY
// ==========================================

const handleWatchParty =
async () => {
// User must be logged in
if (!user) {
alert(
"Please sign in to start a Watch Party."
);


    return;
  }

  /*
   * Get current URL
   *
   * Example:
   * /watch/65a123456789
   *
   * We extract the video ID
   * from the URL.
   */

  const pathname =
    window.location.pathname;

  const pathParts =
    pathname.split(
      "/"
    );

  /*
   * Expected URL:
   *
   * /watch/VIDEO_ID
   *
   * Therefore:
   *
   * pathParts[0] = ""
   * pathParts[1] = "watch"
   * pathParts[2] = VIDEO_ID
   */

  let videoId = "";

  if (
    pathParts[1] ===
    "watch"
  ) {
    videoId =
      pathParts[2] || "";
  }

  // No video detected
  if (!videoId) {
    alert(
      "Open a video first to start a Watch Party."
    );

    return;
  }

  try {
    setIsCreatingParty(
      true
    );

    // Create Watch Party
   const response = await axiosInstance.post(
  "/watchparty/create",
  {
    videoId,
    hostId: user._id,
    username:
      user.channelname ||
      user.name ||
      "Host",
  }
);

    const roomId =
      response.data
        ?.roomId;

    if (!roomId) {
      throw new Error(
        "Room ID was not returned from server."
      );
    }

    // Redirect to Watch Party
    router.push(
      `/watch-party/${roomId}`
    );
  } catch (error: any) {
    console.error(
      "Watch Party creation error:",
      error
    );

    alert(
      error?.response
        ?.data?.message ||
        "Unable to create Watch Party. Please try again."
    );
  } finally {
    setIsCreatingParty(
      false
    );
  }
};


return ( <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-white">


  {/* ==========================================
      LEFT SECTION
  ========================================== */}

  <div className="flex items-center gap-4">

    {/* MENU */}

    <Button
      variant="ghost"
      size="icon"
      className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      <Menu className="h-6 w-6" />
    </Button>

    {/* LOGO */}

    <Link
      href="/"
      className="flex items-center gap-1"
    >
      <div className="rounded bg-red-600 p-1">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="white"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      </div>

      <span className="text-xl font-medium">
        YourTube
      </span>

      <span className="ml-1 text-xs text-gray-400">
        IN
      </span>
    </Link>
  </div>

  {/* ==========================================
      SEARCH SECTION
  ========================================== */}

  <form
    onSubmit={
      handleSearch
    }
    className="mx-4 flex max-w-2xl flex-1 items-center gap-2"
  >
    <div className="flex flex-1">

      <Input
        type="search"
        placeholder="Search"
        value={
          searchQuery
        }
        onKeyDown={
          handleKeypress
        }
        onChange={(
          e: React.ChangeEvent<HTMLInputElement>
        ) =>
          setSearchQuery(
            e.target.value
          )
        }
        className="rounded-l-full border-r-0 bg-white text-gray-900 focus-visible:ring-0 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      />

      <Button
        type="submit"
        className="rounded-r-full border border-l-0 border-gray-200 bg-gray-50 px-6 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <Search className="h-5 w-5" />
      </Button>
    </div>

    {/* MICROPHONE */}

    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="rounded-full text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      title="Voice Search"
    >
      <Mic className="h-5 w-5" />
    </Button>

    {/* THEME TOGGLE */}

    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="rounded-full text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      onClick={
        toggleTheme
      }
      title={
        theme === "dark"
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
    >
      {theme ===
      "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  </form>

  {/* ==========================================
      RIGHT SECTION
  ========================================== */}

  <div className="flex items-center gap-2">

    {user ? (
      <>
        {/* CREATE VIDEO */}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          title="Create Video"
        >
          <VideoIcon className="h-6 w-6" />
        </Button>

        {/* ==================================
            WATCH PARTY
        ================================== */}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={
            isCreatingParty
          }
          onClick={
            handleWatchParty
          }
          className="relative rounded-full text-gray-700 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
          title="Start Watch Party"
          aria-label="Start Watch Party"
        >
          {isCreatingParty ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <UsersRound className="h-6 w-6" />
          )}
        </Button>

        {/* NOTIFICATIONS */}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          title="Notifications"
        >
          <Bell className="h-6 w-6" />
        </Button>

        {/* USER MENU */}

        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
          >
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full"
            >
              <Avatar className="h-8 w-8">

                <AvatarImage
                  src={
                    user.image
                  }
                />

                <AvatarFallback>
                  {user.channelname?.[0] ||
                    "U"}
                </AvatarFallback>

              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-56"
            align="end"
            forceMount
          >
            {user?.channelname ? (
              <DropdownMenuItem
                asChild
              >
                <Link
                  href={`/channel/${user._id}`}
                >
                  Your channel
                </Link>
              </DropdownMenuItem>
            ) : (
              <div className="px-2 py-1.5">

                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    setisdialogeopen(
                      true
                    )
                  }
                >
                  Create Channel
                </Button>

              </div>
            )}

            <DropdownMenuItem
              asChild
            >
              <Link href="/history">
                History
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              asChild
            >
              <Link href="/liked">
                Liked videos
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              asChild
            >
              <Link href="/watch-later">
                Watch later
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <div className="px-2 py-1">

              <button
                onClick={(
                  e
                ) => {
                  e.stopPropagation();

                  handleLogout();
                }}
                type="button"
                className="w-full cursor-pointer rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Sign out
              </button>

            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    ) : (
      <Button
        className="flex items-center gap-2"
        onClick={
          handlegooglesignin
        }
      >
        <User className="h-4 w-4" />
        Sign in
      </Button>
    )}
  </div>

  {/* CREATE CHANNEL DIALOG */}

  <Channeldialogue
    isopen={
      isdialogeopen
    }
    onclose={() =>
      setisdialogeopen(
        false
      )
    }
    mode="create"
  />
</header>


);
};

export default Header;
