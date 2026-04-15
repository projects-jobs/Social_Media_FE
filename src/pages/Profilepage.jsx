// src/pages/ProfilePage.jsx
// FIXES:
//  1. BASE_IMG replaced by imgUrl() from config — images now render
//  2. avatarUrl() from config — consistent avatars
//  3. Grid images use imgUrl(p.img) — was using BASE_IMG directly before

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API } from "../config";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import PostCard from "../components/Postcard";
import CreatePostModal from "../components/Createpostmodal";
import { imgUrl, avatarUrl } from "../config"; // ← shared config

export default function ProfilePage() {
  const { id }              = useParams();
  const { user }            = useAuth();
  const [profile,   setProfile]   = useState(null);
  const [posts,     setPosts]     = useState([]);
  const [following, setFollowing] = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tab,       setTab]       = useState("posts"); // "posts" | "grid"
  const isMe = user._id === id;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [p, up] = await Promise.all([
          API.getUser(id),
          API.getUserPosts(id),
        ]);
        setProfile(p);
        setPosts(up);
        setFollowing(p.followers?.includes(user._id));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, [id, user._id]);

  const toggleFollow = async () => {
    try {
      if (following) {
        await API.unfollow(id, user._id);
        setProfile((p) => ({ ...p, followers: p.followers.filter((f) => f !== user._id) }));
        setFollowing(false);
      } else {
        await API.follow(id, user._id);
        setProfile((p) => ({ ...p, followers: [...(p.followers || []), user._id] }));
        setFollowing(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreated = (post) => setPosts((p) => [post, ...p]);

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNewPost={() => {}} />
      <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse">
        <div className="flex gap-10 mb-8">
          <div className="w-28 h-28 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-3 pt-4">
            <div className="h-5 bg-gray-200 rounded w-40" />
            <div className="h-3 bg-gray-100 rounded w-56" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  );

  if (!profile) return null;

  // FIX: use imgUrl() for profile picture, fall back to avatarUrl()
  const profileAvatar = imgUrl(profile.profilePicture) || avatarUrl(profile.username);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNewPost={() => setShowModal(true)} />
      {showModal && (
        <CreatePostModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Profile header card ─────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-4">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 items-center sm:items-start">

            {/* Avatar */}
            <div className="shrink-0 relative">
              <div
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full p-0.5 shadow-xl"
                style={{ background: "linear-gradient(135deg,#f43f5e,#ec4899,#a855f7)" }}
              >
                <img
                  src={profileAvatar}
                  alt={profile.username}
                  className="w-full h-full rounded-full object-cover border-2 border-white"
                  onError={(e) => { e.currentTarget.src = avatarUrl(profile.username); }}
                />
              </div>
              {isMe && (
                <button
                  onClick={() => setShowModal(true)}
                  className="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-full shadow-md border-2 border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <h1 className="text-2xl font-black text-gray-900">{profile.username}</h1>
                {isMe ? (
                  <a
                    href="/settings"
                    className="px-5 py-1.5 text-sm font-semibold border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Edit Profile
                  </a>
                ) : (
                  <button
                    onClick={toggleFollow}
                    className={`px-6 py-1.5 text-sm font-bold rounded-xl transition-all ${
                      following
                        ? "border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                        : "text-white shadow-lg hover:scale-105"
                    }`}
                    style={!following ? { background: "linear-gradient(135deg,#f43f5e,#a855f7)" } : {}}
                  >
                    {following ? "Following ✓" : "Follow"}
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-center sm:justify-start gap-8 mb-3">
                {[
                  { label: "posts",     val: posts.length },
                  { label: "followers", val: profile.followers?.length || 0 },
                  { label: "following", val: profile.followings?.length || 0 },
                ].map((s) => (
                  <div key={s.label} className="text-center sm:text-left">
                    <p className="text-xl font-black text-gray-900">{s.val}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>

              {profile.email && (
                <p className="text-sm text-gray-500">{profile.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="flex border-b border-gray-200 bg-white rounded-t-xl overflow-hidden shadow-sm">
          {[
            { id: "grid",  icon: "⊞", label: "Grid"  },
            { id: "posts", icon: "☰", label: "Posts" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-sm font-bold tracking-wide transition-colors flex items-center justify-center gap-2 ${
                tab === t.id
                  ? "border-b-2 border-rose-500 text-rose-500"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-b-xl border border-gray-200 text-center py-20 shadow-sm">
            <div className="text-5xl mb-4">📷</div>
            <p className="text-gray-500 font-semibold">No posts yet</p>
            {isMe && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-5 px-6 py-2.5 text-sm font-bold text-white rounded-2xl shadow hover:scale-105 transition-all"
                style={{ background: "linear-gradient(135deg,#f43f5e,#a855f7)" }}
              >
                Share your first photo
              </button>
            )}
          </div>
        ) : tab === "grid" ? (
          /* ── GRID VIEW ─────────────────────────────────────────────────── */
          <div className="grid grid-cols-3 gap-0.5 bg-white rounded-b-xl overflow-hidden shadow-sm border border-gray-200">
            {posts.map((p) => {
              // FIX: imgUrl(p.img) prepends BASE_IMG — images now show in grid
              const src = imgUrl(p.img);
              return (
                <div
                  key={p._id}
                  className="aspect-square relative overflow-hidden group bg-gray-100"
                >
                  {src ? (
                    <img
                      src={src}
                      alt="post"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-50 to-purple-50 p-2">
                      <p className="text-xs text-gray-400 text-center line-clamp-4">{p.desc}</p>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <span className="text-white text-sm font-bold flex items-center gap-1">
                      ❤️ {p.likes?.length || 0}
                    </span>
                    <span className="text-white text-sm font-bold flex items-center gap-1">
                      💬 {p.comments?.length || 0}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── LIST VIEW ─────────────────────────────────────────────────── */
          <div className="space-y-4 mt-4">
            {posts.map((p) => (
              <PostCard key={p._id} post={p} setPosts={setPosts} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}