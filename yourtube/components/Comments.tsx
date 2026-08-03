"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Languages,
  Flag,
  Trash2,
  Pencil,
  X,
  MapPin,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";

interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  commentbody: string;
  usercommented: string;
  commentedon: string;

  language?: string;
  location?: string | null;
  showLocation?: boolean;

  likes?: string[];
  dislikes?: string[];

  moderationStatus?: string;
  reportCount?: number;
}

interface CommentsProps {
  videoId: string | string[] | undefined;
}

type SortType = "top" | "newest";


// ==========================================
// TIME AGO
// ==========================================

const timeAgo = (date: string | number) => {
  const diff = Date.now() - new Date(date).getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  if (hours < 24) {
    return `${hours}h`;
  }

  if (days < 7) {
    return `${days}d`;
  }

  if (weeks < 5) {
    return `${weeks}w`;
  }

  if (months < 12) {
    return `${months}mo`;
  }

  return `${Math.floor(months / 12)}y`;
};


// ==========================================
// MAIN COMPONENT
// ==========================================

const Comments = ({
  videoId,
}: CommentsProps) => {

  const { user } = useUser();

  const [comments, setComments] =
    useState<Comment[]>([]);

  const [newComment, setNewComment] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [posting, setPosting] =
    useState(false);

  const [sortBy, setSortBy] =
    useState<SortType>("top");

  const [showSortMenu, setShowSortMenu] =
    useState(false);

  const [showCommentInput, setShowCommentInput] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editText, setEditText] =
    useState("");

  const [openMenuId, setOpenMenuId] =
    useState<string | null>(null);

  const [reportingId, setReportingId] =
    useState<string | null>(null);

  const [reportReason, setReportReason] =
    useState("Inappropriate content");

  const [language, setLanguage] =
    useState("en");

  const [showLocation, setShowLocation] =
    useState(false);

  const [location, setLocation] =
    useState("");

  const [translated, setTranslated] =
    useState<Record<string, boolean>>({});

  const [translationText, setTranslationText] =
    useState<Record<string, string>>({});

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);


  // ==========================================
  // VIDEO ID
  // ==========================================

  const id = Array.isArray(videoId)
    ? videoId[0]
    : videoId;


  // ==========================================
  // LOAD COMMENTS
  // ==========================================

  const loadComments = async () => {

    if (!id) {
      return;
    }

    try {

      setLoading(true);

      const response =
        await axiosInstance.get(
          `/comment/${id}`
        );

      if (
        Array.isArray(response.data)
      ) {

        setComments(
          response.data
        );

      } else {

        setComments([]);

      }

    } catch (error) {

      console.error(
        "Error loading comments:",
        error
      );

      setComments([]);

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadComments();

  }, [id]);


  // ==========================================
  // SORT COMMENTS
  // ==========================================

  const sortedComments = useMemo(() => {

    const copy = [
      ...comments,
    ];

    if (
      sortBy === "newest"
    ) {

      return copy.sort(
        (a, b) =>
          new Date(
            b.commentedon
          ).getTime() -
          new Date(
            a.commentedon
          ).getTime()
      );

    }

    return copy.sort(
      (a, b) =>
        (b.likes?.length || 0) -
        (a.likes?.length || 0)
    );

  }, [
    comments,
    sortBy,
  ]);


  // ==========================================
  // POST COMMENT
  // ==========================================

  const handlePostComment =
    async () => {

      if (
        !user ||
        !newComment.trim() ||
        !id
      ) {

        return;

      }

      try {

        setPosting(true);

        const response =
          await axiosInstance.post(
            "/comment/postcomment",
            {
              videoid: id,

              userid:
                user._id,

              commentbody:
                newComment.trim(),

              usercommented:
                user.channelname ||
                "User",

              language:

                language,

              location:
                showLocation
                  ? location
                  : null,

              showLocation:
                showLocation,
            }
          );


        if (
          response.data?.comment
        ) {

          setNewComment("");

          setLocation("");

          setShowLocation(
            false
          );

          setShowCommentInput(
            false
          );

          await loadComments();

        }

      } catch (error: any) {

        console.error(
          "Post comment error:",
          error
        );

        alert(
          error?.response?.data
            ?.message ||
            "Failed to post comment"
        );

      } finally {

        setPosting(false);

      }

    };


  // ==========================================
  // EDIT COMMENT
  // ==========================================

  const startEdit = (
    comment: Comment
  ) => {

    setEditingId(
      comment._id
    );

    setEditText(
      comment.commentbody
    );

    setOpenMenuId(null);

  };


  const handleUpdateComment =
    async () => {

      if (
        !editingId ||
        !editText.trim()
      ) {

        return;

      }

      try {

        setActionLoading(
          editingId
        );

        await axiosInstance.post(
          `/comment/editcomment/${editingId}`,
          {
            commentbody:
              editText.trim(),
          }
        );

        setComments(
          previous =>
            previous.map(
              comment =>
                comment._id ===
                editingId
                  ? {
                      ...comment,
                      commentbody:
                        editText.trim(),
                    }
                  : comment
            )
        );

        setEditingId(null);

        setEditText("");

      } catch (error) {

        console.error(
          "Edit error:",
          error
        );

      } finally {

        setActionLoading(null);

      }

    };


  // ==========================================
  // DELETE COMMENT
  // ==========================================

  const handleDelete = async (
    commentId: string
  ) => {

    const confirmed =
      window.confirm(
        "Delete this comment?"
      );

    if (!confirmed) {
      return;
    }

    try {

      setActionLoading(
        commentId
      );

      await axiosInstance.delete(
        `/comment/deletecomment/${commentId}`
      );

      setComments(
        previous =>
          previous.filter(
            comment =>
              comment._id !==
              commentId
          )
      );

      setOpenMenuId(null);

    } catch (error) {

      console.error(
        "Delete error:",
        error
      );

    } finally {

      setActionLoading(null);

    }

  };


  // ==========================================
  // LIKE
  // ==========================================

  const handleLike = async (
    commentId: string
  ) => {

    if (!user) {

      alert(
        "Please login to like comments."
      );

      return;

    }

    try {

      setActionLoading(
        commentId
      );

      const response =
        await axiosInstance.post(
          `/comment/like/${commentId}`,
          {
            userid:
              user._id,
          }
        );


      const likes =
        response.data?.likes ??
        0;

      const dislikes =
        response.data?.dislikes ??
        0;


      setComments(
        previous =>
          previous.map(
            comment => {

              if (
                comment._id !==
                commentId
              ) {

                return comment;

              }

              return {
                ...comment,

                likes:
                  Array(
                    likes
                  ).fill("like"),

                dislikes:
                  Array(
                    dislikes
                  ).fill("dislike"),
              };

            }
          )
      );

    } catch (error) {

      console.error(
        "Like error:",
        error
      );

    } finally {

      setActionLoading(null);

    }

  };


  // ==========================================
  // DISLIKE
  // ==========================================

  const handleDislike =
    async (
      commentId: string
    ) => {

      if (!user) {

        alert(
          "Please login to dislike comments."
        );

        return;

      }

      try {

        setActionLoading(
          commentId
        );

        const response =
          await axiosInstance.post(
            `/comment/dislike/${commentId}`,
            {
              userid:
                user._id,
            }
          );


        const likes =
          response.data?.likes ??
          0;

        const dislikes =
          response.data?.dislikes ??
          0;


        setComments(
          previous =>
            previous.map(
              comment => {

                if (
                  comment._id !==
                  commentId
                ) {

                  return comment;

                }

                return {
                  ...comment,

                  likes:
                    Array(
                      likes
                    ).fill("like"),

                  dislikes:
                    Array(
                      dislikes
                    ).fill("dislike"),
                };

              }
            )
        );

      } catch (error) {

        console.error(
          "Dislike error:",
          error
        );

      } finally {

        setActionLoading(null);

      }

    };


  // ==========================================
  // REPORT
  // ==========================================

  const handleReport =
    async () => {

      if (
        !reportingId ||
        !user
      ) {

        return;

      }

      try {

        setActionLoading(
          reportingId
        );

        await axiosInstance.post(
          `/comment/report/${reportingId}`,
          {
            userid:
              user._id,

            reason:
              reportReason,
          }
        );

        alert(
          "Thanks. This comment has been reported for review."
        );

        setReportingId(null);

      } catch (error: any) {

        console.error(
          "Report error:",
          error
        );

        alert(
          error?.response?.data
            ?.message ||
            "Failed to report comment"
        );

      } finally {

        setActionLoading(null);

      }

    };


  // ==========================================
  // TRANSLATE
  // ==========================================

  const handleTranslate = (
    comment: Comment
  ) => {

    if (
      translated[
        comment._id
      ]
    ) {

      setTranslated(
        previous => ({
          ...previous,
          [comment._id]:
            false,
        })
      );

      return;

    }


    /*
      TEMPORARY FRONTEND TRANSLATION UI.

      Replace this later with your
      Google Translate / LibreTranslate
      backend API.
    */

    setTranslationText(
      previous => ({
        ...previous,

        [comment._id]:
          `Translated version of: "${comment.commentbody}"`,
      })
    );

    setTranslated(
      previous => ({
        ...previous,
        [comment._id]:
          true,
      })
    );

  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <section className="mt-8">

        <div className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />

        <div className="mt-6 space-y-6">

          {[1, 2, 3].map(
            item => (

              <div
                key={item}
                className="flex gap-4"
              >

                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />

                <div className="flex-1 space-y-2">

                  <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />

                  <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />

                </div>

              </div>

            )
          )}

        </div>

      </section>

    );

  }


  // ==========================================
  // UI
  // ==========================================

  return (

    <section className="mt-8 w-full">


      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div className="flex items-center gap-8 mb-6">


        <h2 className="text-xl font-bold">

          {comments.length}{" "}

          {comments.length === 1
            ? "Comment"
            : "Comments"}

        </h2>


        {/* SORT */}
        
        <div className="relative">


          <button
            onClick={() =>
              setShowSortMenu(
                previous =>
                  !previous
              )
            }
            className="flex items-center gap-2 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full px-3 py-2"
          >

            <span>

              {sortBy ===
              "top"
                ? "Top comments"
                : "Newest first"}

            </span>

            <ChevronDown
              size={18}
            />

          </button>


          {showSortMenu && (

            <div className="absolute top-full left-0 mt-1 z-30 w-44 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl overflow-hidden">


              <button
                onClick={() => {

                  setSortBy(
                    "top"
                  );

                  setShowSortMenu(
                    false
                  );

                }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              >

                Top comments

              </button>


              <button
                onClick={() => {

                  setSortBy(
                    "newest"
                  );

                  setShowSortMenu(
                    false
                  );

                }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              >

                Newest first

              </button>


            </div>

          )}

        </div>

      </div>


      {/* ===================================== */}
      {/* COMMENT INPUT */}
      {/* ===================================== */}

      {user && (

        <div className="flex gap-4 mb-8">


          <Avatar className="h-10 w-10 flex-shrink-0">

            <AvatarImage
              src={
                user.image ||
                ""
              }
            />

            <AvatarFallback>

              {user.channelname
                ?.charAt(0)
                .toUpperCase() ||
                "U"}

            </AvatarFallback>

          </Avatar>


          <div className="flex-1">


            {!showCommentInput ? (

              <button
                onClick={() =>
                  setShowCommentInput(
                    true
                  )
                }
                className="w-full text-left border-b border-gray-400 dark:border-gray-600 pb-2 text-sm text-gray-500 hover:border-gray-900 dark:hover:border-white transition"
              >

                Add a comment...

              </button>

            ) : (

              <div className="space-y-3">


                <textarea
                  autoFocus
                  value={
                    newComment
                  }
                  onChange={e =>
                    setNewComment(
                      e.target.value
                    )
                  }
                  placeholder="Add a comment..."
                  className="w-full min-h-[80px] resize-none rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />


                {/* EXTRA OPTIONS */}

                <div className="flex flex-wrap items-center gap-3">


                  <select
                    value={
                      language
                    }
                    onChange={e =>
                      setLanguage(
                        e.target.value
                      )
                    }
                    className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                  >

                    <option value="en">
                      English
                    </option>

                    <option value="hi">
                      Hindi
                    </option>

                    <option value="gu">
                      Gujarati
                    </option>

                    <option value="mr">
                      Marathi
                    </option>

                    <option value="bn">
                      Bengali
                    </option>

                    <option value="ta">
                      Tamil
                    </option>

                    <option value="te">
                      Telugu
                    </option>

                  </select>


                  <label className="flex items-center gap-2 text-sm text-gray-500">

                    <input
                      type="checkbox"
                      checked={
                        showLocation
                      }
                      onChange={e =>
                        setShowLocation(
                          e.target.checked
                        )
                      }
                    />

                    <MapPin
                      size={15}
                    />

                    Show location

                  </label>


                  {showLocation && (

                    <input
                      value={
                        location
                      }
                      onChange={e =>
                        setLocation(
                          e.target.value
                        )
                      }
                      placeholder="City / region"
                      className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                    />

                  )}

                </div>


                {/* BUTTONS */}

                <div className="flex justify-end gap-2">


                  <Button
                    variant="ghost"
                    onClick={() => {

                      setNewComment(
                        ""
                      );

                      setShowCommentInput(
                        false
                      );

                    }}
                  >

                    Cancel

                  </Button>


                  <Button
                    onClick={
                      handlePostComment
                    }
                    disabled={
                      posting ||
                      !newComment.trim()
                    }
                  >

                    <Send
                      size={16}
                      className="mr-2"
                    />

                    {posting
                      ? "Commenting..."
                      : "Comment"}

                  </Button>


                </div>

              </div>

            )}

          </div>

        </div>

      )}


      {/* ===================================== */}
      {/* COMMENTS */}
      {/* ===================================== */}

      <div className="space-y-7">


        {sortedComments.length ===
        0 ? (

          <div className="py-10 text-center text-gray-500">

            <p className="font-medium">

              No comments yet

            </p>

            <p className="text-sm mt-1">

              Be the first to share
              your thoughts.

            </p>

          </div>

        ) : (

          sortedComments.map(
            comment => (

              <div
                key={
                  comment._id
                }
                className="flex gap-4"
              >


                {/* AVATAR */}
<Avatar className="h-10 w-10 flex-shrink-0">
  <AvatarFallback>
    {comment.usercommented
      ?.charAt(0)
      .toUpperCase() || "U"}
  </AvatarFallback>
</Avatar>


                {/* BODY */}

                <div className="flex-1 min-w-0">


                  {/* NAME + TIME + MENU */}

                  <div className="flex items-center">


                    <div className="flex items-center gap-2">

                      <span className="font-semibold text-sm">

                        {
                          comment.usercommented
                        }

                      </span>

                      <span className="text-xs text-gray-500">

                        {timeAgo(
                          comment.commentedon
                        )}

                      </span>

                      {comment.showLocation &&
                        comment.location && (

                          <span className="flex items-center gap-1 text-xs text-gray-500">

                            <MapPin
                              size={12}
                            />

                            {
                              comment.location
                            }

                          </span>

                        )}

                    </div>


                    {/* MENU */}

                    <div className="relative ml-auto">


                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId ===
                            comment._id
                              ? null
                              : comment._id
                          )
                        }
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                      >

                        <MoreVertical
                          size={18}
                        />

                      </button>


                      {openMenuId ===
                        comment._id && (

                        <div className="absolute right-0 top-10 z-40 w-44 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl overflow-hidden">


                          {comment.userid ===
                            user?._id && (

                            <>

                              <button
                                onClick={() =>
                                  startEdit(
                                    comment
                                  )
                                }
                                className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                              >

                                <Pencil
                                  size={16}
                                />

                                Edit

                              </button>


                              <button
                                onClick={() =>
                                  handleDelete(
                                    comment._id
                                  )
                                }
                                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                              >

                                <Trash2
                                  size={16}
                                />

                                Delete

                              </button>

                            </>

                          )}


                          <button
                            onClick={() => {

                              setReportingId(
                                comment._id
                              );

                              setOpenMenuId(
                                null
                              );

                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                          >

                            <Flag
                              size={16}
                            />

                            Report

                          </button>


                        </div>

                      )}

                    </div>

                  </div>


                  {/* EDIT */}

                  {editingId ===
                  comment._id ? (

                    <div className="mt-2">


                      <textarea
                        value={
                          editText
                        }
                        onChange={e =>
                          setEditText(
                            e.target.value
                          )
                        }
                        className="w-full min-h-[80px] rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent p-3 text-sm"
                      />


                      <div className="flex justify-end gap-2 mt-2">


                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {

                            setEditingId(
                              null
                            );

                            setEditText(
                              ""
                            );

                          }}
                        >

                          Cancel

                        </Button>


                        <Button
                          size="sm"
                          onClick={
                            handleUpdateComment
                          }
                          disabled={
                            !editText.trim()
                          }
                        >

                          Save

                        </Button>

                      </div>

                    </div>

                  ) : (

                    <>

                      {/* COMMENT */}

                      <p className="mt-1 text-sm leading-6 whitespace-pre-wrap break-words">

                        {
                          comment.commentbody
                        }

                      </p>


                      {/* TRANSLATION */}

                      {translated[
                        comment._id
                      ] && (

                        <div className="mt-3 rounded-lg bg-gray-100 dark:bg-gray-800 p-3 text-sm">

                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">

                            <Languages
                              size={14}
                            />

                            Translation

                          </div>

                          {
                            translationText[
                              comment._id
                            ]
                          }

                        </div>

                      )}


                      {/* ACTIONS */}

                      <div className="flex items-center gap-1 mt-2">


                        {/* LIKE GROUP */}

                        <button
                          onClick={() =>
                            handleLike(
                              comment._id
                            )
                          }
                          disabled={
                            actionLoading ===
                            comment._id
                          }
                          className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >

                          <ThumbsUp
                            size={18}
                          />

                          <span className="text-xs">

                            {comment
                              .likes
                              ?.length ||
                              0}

                          </span>

                        </button>


                        {/* DISLIKE */}

                        <button
                          onClick={() =>
                            handleDislike(
                              comment._id
                            )
                          }
                          disabled={
                            actionLoading ===
                            comment._id
                          }
                          className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >

                          <ThumbsDown
                            size={18}
                          />

                        </button>


                        {/* REPLY */}

                        <button
                          className="rounded-full px-4 py-2 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >

                          Reply

                        </button>


                        {/* TRANSLATE */}

                        <button
                          onClick={() =>
                            handleTranslate(
                              comment
                            )
                          }
                          className="rounded-full px-3 py-2 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >

                          {translated[
                            comment._id
                          ]
                            ? "Hide translation"
                            : "Translate"}

                        </button>


                      </div>

                    </>

                  )}

                </div>

              </div>

            )

          )

        )}

      </div>


      {/* ===================================== */}
      {/* REPORT MODAL */}
      {/* ===================================== */}

      {reportingId && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">


          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl">


            <div className="flex items-center justify-between">

              <h3 className="text-lg font-semibold">

                Report comment

              </h3>


              <button
                onClick={() =>
                  setReportingId(
                    null
                  )
                }
                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >

                <X
                  size={20}
                />

              </button>

            </div>


            <p className="text-sm text-gray-500 mt-2">

              Select a reason for
              reporting this comment.

            </p>


            <select
              value={
                reportReason
              }
              onChange={e =>
                setReportReason(
                  e.target.value
                )
              }
              className="w-full mt-5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm"
            >

              <option>
                Inappropriate content
              </option>

              <option>
                Spam
              </option>

              <option>
                Harassment
              </option>

              <option>
                Hate speech
              </option>

              <option>
                Misleading information
              </option>

              <option>
                Other
              </option>

            </select>


            <div className="flex justify-end gap-2 mt-6">


              <Button
                variant="ghost"
                onClick={() =>
                  setReportingId(
                    null
                  )
                }
              >

                Cancel

              </Button>


              <Button
                onClick={
                  handleReport
                }
                disabled={
                  actionLoading ===
                  reportingId
                }
              >

                <Flag
                  size={16}
                  className="mr-2"
                />

                Report

              </Button>


            </div>

          </div>

        </div>

      )}

    </section>

  );

};


export default Comments;