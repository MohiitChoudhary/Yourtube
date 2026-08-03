"use client";

import {
  Home,
  Compass,
  PlaySquare,
  Clock,
  ThumbsUp,
  History,
  User,
} from "lucide-react";

import Link from "next/link";
import React, {
  useState,
} from "react";

import { Button } from "./button";

import Channeldialogue from "./channeldialogue";

import { useUser } from "@/lib/AuthContext";

const Sidebar = () => {

  const { user } = useUser();

  const [
    isdialogeopen,
    setisdialogeopen,
  ] = useState(false);

  const buttonClass =
    "w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white";

  return (
    <aside className="w-64 min-h-screen bg-white text-gray-900 border-r border-gray-200 dark:bg-gray-950 dark:text-white dark:border-gray-800">

      <nav className="space-y-1 p-2">

        {/* HOME */}

        <Link href="/">
          <Button
            variant="ghost"
            className={buttonClass}
          >
            <Home className="w-5 h-5 mr-3" />
            Home
          </Button>
        </Link>


        {/* EXPLORE */}

        <Link href="/explore">
          <Button
            variant="ghost"
            className={buttonClass}
          >
            <Compass className="w-5 h-5 mr-3" />
            Explore
          </Button>
        </Link>


        {/* SUBSCRIPTIONS */}

        <Link href="/subscriptions">
          <Button
            variant="ghost"
            className={buttonClass}
          >
            <PlaySquare className="w-5 h-5 mr-3" />
            Subscriptions
          </Button>
        </Link>


        {user && (

          <>

            {/* DIVIDER */}

            <div className="border-t border-gray-200 dark:border-gray-800 pt-2 mt-2">


              {/* HISTORY */}

              <Link href="/history">
                <Button
                  variant="ghost"
                  className={buttonClass}
                >
                  <History className="w-5 h-5 mr-3" />
                  History
                </Button>
              </Link>


              {/* LIKED */}

              <Link href="/liked">
                <Button
                  variant="ghost"
                  className={buttonClass}
                >
                  <ThumbsUp className="w-5 h-5 mr-3" />
                  Liked videos
                </Button>
              </Link>


              {/* WATCH LATER */}

              <Link href="/watch-later">
                <Button
                  variant="ghost"
                  className={buttonClass}
                >
                  <Clock className="w-5 h-5 mr-3" />
                  Watch later
                </Button>
              </Link>


              {/* CHANNEL */}

              {user?.channelname ? (

                <Link
                  href={`/channel/${user._id}`}
                >
                  <Button
                    variant="ghost"
                    className={buttonClass}
                  >
                    <User className="w-5 h-5 mr-3" />
                    Your channel
                  </Button>
                </Link>

              ) : (

                <div className="px-2 py-1.5">

                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
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

            </div>

          </>

        )}

      </nav>


      {/* CREATE CHANNEL DIALOG */}

      <Channeldialogue
        isopen={
          isdialogeopen
        }
        onclose={() =>
          setisdialogeopen(false)
        }
        mode="create"
      />

    </aside>
  );
};

export default Sidebar;