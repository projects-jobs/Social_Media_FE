// src/components/PostCard.jsx
// FIXES:
//  1. BASE_IMG imported from config — single source of truth
//  2. imgUrl() used for post image — shows correctly
//  3. post.desc = editDesc REMOVED — was mutating a prop (React error)
//     Instead we use local state `localDesc` and update setPosts via callback
//  4. Comment username resolved correctly from populated userId.username
//  5. Video detection retained
//  6. avatarUrl() from config for consistent avatars

import { useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../api";
import { useAuth } from "../context/AuthContext";
import { imgUrl, avatarUrl } from "../config";  // ← shared config

const fmt = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export default function PostCard({ post, setPosts }) {
  const { user } = useAuth();

  // ── Resolve display name (never show raw _id) ────────────────────────────
  const displayName =
    post.userId?.username ||
    post.username          ||
    post.userName          ||
    "User";

  const profileId = post.userId?._id || post.userId || "";
  const isOwner   = user?._id === (profileId?.toString?.() || profileId);

  const [showMenu,      setShowMenu]      = useState(false);
  const [isEditing,     setIsEditing]     = useState(false);
  // FIX: local state for description — never mutate the prop
  const [localDesc,     setLocalDesc]     = useState(post.desc || "");
  const [editDesc,      setEditDesc]      = useState(post.desc || "");

  const [liked,         setLiked]         = useState(post.likes?.includes(user?._id));
  const [likeCount,     setLikeCount]     = useState(post.likes?.length || 0);
  const [comment,       setComment]       = useState("");
  const [comments,      setComments]      = useState(post.comments || []);
  const [showComments,  setShowComments]  = useState(false);
  const [posting,       setPosting]       = useState(false);

  // Image / video
  const mediaSrc  = imgUrl(post.img);  // ← uses shared config, null if no img
  const isVideo   = post.img?.match(/\.(mp4|webm|ogg|mov)$/i);

  const avatar = avatarUrl(displayName); // ← uses shared config

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) { setShowMenu(false); return; }
    try {
      await API.deletePost(post._id, user._id);
      if (setPosts) setPosts((prev) => prev.filter((p) => p._id !== post._id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
    setShowMenu(false);
  };

  // ── Update description ────────────────────────────────────────────────────
  // FIX: store updated desc in local state (localDesc) instead of post.desc = ...
  const handleUpdate = async () => {
    try {
      await API.updatePost(post._id, { userId: user._id, desc: editDesc });
      setLocalDesc(editDesc);   // ✅ update local state — no prop mutation
      setIsEditing(false);
      // Also update the post in the parent list so it stays in sync
      if (setPosts) {
        setPosts((prev) =>
          prev.map((p) => (p._id === post._id ? { ...p, desc: editDesc } : p))
        );
      }
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  };

  // ── Like ──────────────────────────────────────────────────────────────────
  const toggleLike = async () => {
    try {
      await API.likePost(post._id, user._id);
      if (liked) { setLikeCount((c) => c - 1); setLiked(false); }
      else        { setLikeCount((c) => c + 1); setLiked(true);  }
    } catch (err) {
      console.error(err.message);
    }
  };

  // ── Comment ───────────────────────────────────────────────────────────────
  const submitComment = async () => {
    if (!comment.trim()) return;
    setPosting(true);
    try {
      await API.commentPost(post._id, { userId: user._id, text: comment });
      // Store full object with username so it renders immediately without refetch
      setComments((prev) => [
        ...prev,
        {
          _id:       Date.now().toString(),
          userId:    { _id: user._id, username: user.username }, // populated shape
          text:      comment,
          createdAt: new Date(),
        },
      ]);
      setComment("");
      if (!showComments) setShowComments(true);
    } catch (err) {
      console.error(err.message);
    }
    setPosting(false);
  };

  // ── Resolve comment author name ───────────────────────────────────────────
  // Handles both: populated { userId: { username } } and legacy { username }
  const commentName = (c) =>
    c.userId?.username ||    // populated from backend .populate("comments.userId","username")
    c.username         ||    // our locally-added optimistic comment
    "User";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Link to={`/profile/${profileId}`}>
          <img
            src={avatar}
            alt={displayName}
            className="w-9 h-9 rounded-full ring-2 ring-rose-100 object-cover"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            to={`/profile/${profileId}`}
            className="text-sm font-bold text-gray-900 hover:text-rose-500 transition-colors truncate block"
          >
            {displayName}
          </Link>
          <p className="text-xs text-gray-400">{fmt(post.createdAt)}</p>
        </div>

        {/* 3-dot owner menu */}
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu((o) => !o)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-40">
                  <button
                    onClick={() => { setIsEditing(true); setEditDesc(localDesc); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Media (image OR video) ─────────────────────────────────────────── */}
      {/* FIX: mediaSrc comes from imgUrl(post.img) which prepends BASE_IMG */}
      {mediaSrc && (
        <div className="w-full bg-black flex justify-center items-center">
          {isVideo ? (
            <video
              src={mediaSrc}
              controls
              playsInline
              className="w-full max-h-[600px] outline-none"
            />
          ) : (
            <img
              src={mediaSrc}
              alt="post"
              className="w-full object-contain max-h-[600px]"
              style={{ display: "block" }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}
        </div>
      )}

      {/* ── Actions & body ────────────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center gap-4 mb-3">

          {/* Like */}
          <button onClick={toggleLike} className="flex items-center gap-1.5 group">
            <svg
              className={`w-6 h-6 transition-all duration-200 ${
                liked
                  ? "fill-rose-500 text-rose-500 scale-110"
                  : "fill-none text-gray-700 group-hover:text-rose-400"
              }`}
              stroke="currentColor"
              strokeWidth={liked ? 0 : 1.5}
              viewBox="0 0 24 24"
            >
              <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
            </svg>
            <span className="text-sm font-semibold text-gray-700">{likeCount}</span>
          </button>

          {/* Comment toggle */}
          <button
            onClick={() => setShowComments((s) => !s)}
            className="flex items-center gap-1.5 group"
          >
            <svg
              className="w-6 h-6 fill-none text-gray-700 group-hover:text-sky-400 transition-colors"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785 4.5 4.5 0 003.111-1.394c.245-.246.51-.408.851-.444A9.767 9.767 0 0012 20.25z"/>
            </svg>
            <span className="text-sm font-semibold text-gray-700">{comments.length}</span>
          </button>
        </div>

        {/* Caption / Edit mode */}
        {isEditing ? (
          <div className="mb-3">
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows={3}
              className="w-full text-sm border border-rose-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-100 resize-none bg-rose-50/30"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs font-semibold text-gray-400 px-3 py-1.5 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="text-xs font-bold px-4 py-1.5 rounded-lg text-white shadow"
                style={{ background: "linear-gradient(135deg,#f43f5e,#a855f7)" }}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          localDesc && (    /* ✅ uses localDesc, not post.desc */
            <p className="text-sm text-gray-800 mb-3 leading-relaxed">
              <span className="font-bold mr-1.5">{displayName}</span>
              {localDesc}
            </p>
          )
        )}

        {/* Comments list */}
        {showComments && (
          <div className="mb-3 space-y-2 bg-gray-50 rounded-xl p-3">
            {comments.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-1">No comments yet</p>
            ) : (
              comments.map((c, i) => (
                <div key={c._id || i} className="flex gap-2 text-sm">
                  <img
                    src={avatarUrl(commentName(c))}
                    alt={commentName(c)}
                    className="w-6 h-6 rounded-full shrink-0 mt-0.5"
                  />
                  <div>
                    {/* FIX: commentName() resolves to username not _id */}
                    <span className="font-bold text-gray-900">{commentName(c)}</span>
                    <span className="text-gray-600 ml-1.5">{c.text}</span>
                    {c.createdAt && (
                      <span className="text-xs text-gray-400 ml-2">{fmt(c.createdAt)}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Comment input */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <img
            src={avatarUrl(user.username)}
            className="w-7 h-7 rounded-full shrink-0"
            alt="me"
          />
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submitComment()}
            placeholder="Add a comment…"
            className="flex-1 text-sm bg-gray-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-rose-200 focus:bg-white border border-transparent transition-all"
          />
          <button
            onClick={submitComment}
            disabled={posting || !comment.trim()}
            className="text-sm font-bold text-rose-500 disabled:opacity-30 hover:text-rose-600 transition-colors"
          >
            {posting ? "..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}