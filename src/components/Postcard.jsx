// ✅ Import API from api/index.js
import { useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../api";  
import { useAuth } from "../context/AuthContext";
import { avatarUrl } from "../config";

const BASE_IMG = "https://social-media-be-jzvd.onrender.com/images/";
const fmt = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

function resolveImg(img) {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `${BASE_IMG}${img}`;
}

export default function PostCard({ post, setPosts }) {
  const { user } = useAuth();

  const displayName =
    post.userId?.username || post.username || post.userName ||
    (typeof post.userId === "string" ? post.userId.slice(0, 8) : "User");
  const profileId = post.userId?._id || post.userId || "";
  const isOwner   = user?._id === profileId || user?._id === post.userId;

  const [showMenu,     setShowMenu]     = useState(false);
  const [isEditing,    setIsEditing]    = useState(false);
  const [editDesc,     setEditDesc]     = useState(post.desc || "");
  const [liked,        setLiked]        = useState(post.likes?.includes(user?._id));
  const [likeCount,    setLikeCount]    = useState(post.likes?.length || 0);
  const [comment,      setComment]      = useState("");
  const [comments,     setComments]     = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [posting,      setPosting]      = useState(false);
  const [imgError,     setImgError]     = useState(false);
  const [ setLocalDesc]     = useState(post.desc || "");
  const rawImg  = post.img || post.image || post.photo || "";
  const postImg = imgError ? null : resolveImg(rawImg);
  const avatar  = avatarUrl(displayName);
  const myAvatar = avatarUrl(user.username);

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) { setShowMenu(false); return; }
    try {
      await API.deletePost(post._id, user._id);
      if (setPosts) setPosts(prev => prev.filter(p => p._id !== post._id));
    } catch (err) { alert("Delete failed: " + err.message); }
    setShowMenu(false);
  };

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

  const toggleLike = async () => {
    try {
      await API.likePost(post._id, user._id);
      if (liked) { setLikeCount(c => c - 1); setLiked(false); }
      else        { setLikeCount(c => c + 1); setLiked(true); }
    } catch (err) { console.error(err.message); }
  };

  const submitComment = async () => {
    if (!comment.trim()) return;
    setPosting(true);
    try {
      await API.commentPost(post._id, { userId: user._id, text: comment });
      setComments(prev => [...prev, { userId: user._id, username: user.username, text: comment, createdAt: new Date() }]);
      setComment("");
      setShowComments(true);
    } catch (err) { console.error(err.message); }
    setPosting(false);
  };

  const commentName = (c) =>
    c.username || c.userId?.username || (c.userId === user._id ? user.username : "User");

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <Link to={`/profile/${profileId}`} className="shrink-0">
          <img src={avatar} alt="av" className="w-10 h-10 rounded-full ring-2 ring-rose-100 object-cover" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${profileId}`} className="text-sm font-bold text-gray-900 hover:text-rose-500 transition-colors block truncate">
            {displayName}
          </Link>
          <p className="text-xs text-gray-400 mt-0.5">{fmt(post.createdAt)}</p>
        </div>
        {isOwner && (
          <div className="relative shrink-0">
            <button onClick={() => setShowMenu(o => !o)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
              </svg>
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-40 overflow-hidden">
                  <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">✏️ Edit</button>
                  <button onClick={handleDelete} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">🗑️ Delete</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Caption — ABOVE image like LinkedIn */}
      {isEditing ? (
        <div className="px-4 mb-3">
          <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3}
            className="w-full text-sm border border-rose-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-100 resize-none" />
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={() => setIsEditing(false)} className="text-xs font-semibold text-gray-400 px-3 py-1.5">Cancel</button>
            <button onClick={handleUpdate} className="text-xs font-bold px-4 py-1.5 rounded-lg text-white" style={{ background: "linear-gradient(135deg,#f43f5e,#a855f7)" }}>Save</button>
          </div>
        </div>
      ) : (
        post.desc && (
          <p className="px-4 pb-3 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{post.desc}</p>
        )
      )}

      {/* IMAGE — full width, no padding, like LinkedIn */}
      {postImg ? (
        <div className="w-full bg-black border-y border-gray-100">
          <img
            src={postImg}
            alt="post"
            className="w-full block"
            style={{ maxHeight: "680px", objectFit: "contain" }}
            onError={() => { console.warn("Image failed to load:", postImg); setImgError(true); }}
          />
        </div>
      ) : rawImg && imgError ? (
        <div className="mx-4 mb-3 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-400 text-center">
          Image could not be loaded
        </div>
      ) : null}

      {/* Stats bar */}
      {(likeCount > 0 || comments.length > 0) && (
        <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-400 border-b border-gray-100">
          {likeCount > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px]"
                style={{ background: "linear-gradient(135deg,#f43f5e,#e11d48)" }}>❤</span>
              {likeCount}
            </span>
          )}
          {comments.length > 0 && (
            <button onClick={() => setShowComments(s => !s)} className="ml-auto hover:text-gray-600 transition-colors">
              {comments.length} comment{comments.length !== 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}

      {/* Like / Comment buttons — LinkedIn style */}
      <div className="px-2 py-0.5 flex items-center border-b border-gray-100">
        <button onClick={toggleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all
            ${liked ? "text-rose-500 bg-rose-50" : "text-gray-500 hover:bg-gray-50"}`}>
          <svg className={`w-5 h-5 transition-all ${liked ? "fill-rose-500" : "fill-none"}`}
            stroke="currentColor" strokeWidth={liked ? 0 : 1.5} viewBox="0 0 24 24">
            <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
          </svg>
          {liked ? "Liked" : "Like"}
        </button>
        <button onClick={() => setShowComments(s => !s)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all">
          <svg className="w-5 h-5 fill-none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A4.5 4.5 0 008.047 18.3c.245-.246.51-.408.851-.444A9.767 9.767 0 0012 20.25z"/>
          </svg>
          Comment
        </button>
      </div>

      {/* Comments */}
      <div className="px-4 pb-4">
        {showComments && comments.length > 0 && (
          <div className="mt-3 space-y-3 mb-3">
            {comments.map((c, i) => (
              <div key={i} className="flex gap-2.5">
                <img src={avatarUrl(commentName(c))} className="w-7 h-7 rounded-full shrink-0 mt-0.5" alt="" />
                <div className="flex-1 bg-gray-50 rounded-2xl px-3 py-2">
                  <p className="text-xs font-bold text-gray-900 mb-0.5">{commentName(c)}</p>
                  <p className="text-sm text-gray-700">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Comment input */}
        <div className="flex items-center gap-2 mt-3">
          <img src={myAvatar} className="w-8 h-8 rounded-full shrink-0" alt="me" />
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border border-transparent focus-within:border-rose-300 focus-within:bg-white transition-all">
            <input value={comment} onChange={e => setComment(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && submitComment()}
              placeholder="Add a comment…"
              className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400" />
            {comment.trim() && (
              <button onClick={submitComment} disabled={posting}
                className="text-xs font-bold text-rose-500 disabled:opacity-40 hover:text-rose-600 shrink-0">Post</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}