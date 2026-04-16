// ✅ Import API from api/index.js
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API } from "../API/index";
import { useAuth } from "../context/AuthContext";
import { avatarUrl } from "../config";
import Navbar from "../components/Navbar";
import PostCard from "../components/Postcard";
import CreatePostModal from "../components/Createpostmodal";

const BASE_IMG = "https://social-media-be-jzvd.onrender.com/images/";
const resolveImg = (img) => {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `${BASE_IMG}${img}`;
};

export default function ProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile,   setProfile]   = useState(null);
  const [posts,     setPosts]     = useState([]);
  const [following, setFollowing] = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tab,       setTab]       = useState("grid");
  const isMe = user._id === id;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [p, up] = await Promise.all([API.getUser(id), API.getUserPosts(id)]);
        setProfile(p); setPosts(up);
        setFollowing(p.followers?.includes(user._id));
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [id, user._id]);

  const toggleFollow = async () => {
    try {
      if (following) {
        await API.unfollow(id, user._id);
        setProfile(p => ({ ...p, followers: p.followers.filter(f => f !== user._id) }));
        setFollowing(false);
      } else {
        await API.follow(id, user._id);
        setProfile(p => ({ ...p, followers: [...(p.followers || []), user._id] }));
        setFollowing(true);
      }
    } catch (e) { console.error(e); }
  };

  const handleCreated = (post) => { setPosts(p => [post, ...p]); setTab("grid"); };

  if (loading) return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg,#1a1a2e,#0f3460)" }}>
      <Navbar onNewPost={() => {}} />
      <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse">
        <div className="bg-white/10 rounded-3xl p-8 mb-4">
          <div className="flex gap-10">
            <div className="w-28 h-28 rounded-full bg-white/20 shrink-0" />
            <div className="flex-1 space-y-3 pt-4">
              <div className="h-5 bg-white/20 rounded w-40" />
              <div className="flex gap-6 mt-3">
                {[...Array(3)].map((_,i)=><div key={i} className="h-8 w-16 bg-white/10 rounded"/>)}
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[...Array(9)].map((_, i) => <div key={i} className="aspect-square bg-white/10 rounded" />)}
        </div>
      </div>
    </div>
  );

  if (!profile) return null;

  const profileAvatar = profile.profilePicture
    ? resolveImg(profile.profilePicture)
    : avatarUrl(profile.username);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 40%,#0f3460 100%)" }}>
      <Navbar onNewPost={() => setShowModal(true)} />
      {showModal && <CreatePostModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Profile header card ── */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 sm:p-8 mb-4">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 items-center sm:items-start">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full p-[3px] shadow-2xl"
                style={{ background: "linear-gradient(135deg,#f43f5e,#ec4899,#a855f7)" }}>
                <img src={profileAvatar} alt={profile.username}
                  className="w-full h-full rounded-full object-cover border-2 border-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
                <h1 className="text-2xl font-black text-white">{profile.username}</h1>
                {isMe ? (
                  <a href="/settings" className="px-5 py-1.5 text-sm font-semibold border border-white/20 rounded-xl text-white/70 hover:bg-white/10 transition-colors">
                    Edit Profile
                  </a>
                ) : (
                  <button onClick={toggleFollow}
                    className={`px-6 py-1.5 text-sm font-bold rounded-xl transition-all ${
                      following ? "border border-white/20 text-white/70 hover:bg-white/10" : "text-white shadow-lg hover:scale-105"
                    }`}
                    style={!following ? { background: "linear-gradient(135deg,#f43f5e,#a855f7)" } : {}}>
                    {following ? "Following ✓" : "Follow"}
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-center sm:justify-start gap-8">
                {[
                  { label: "posts",     val: posts.length },
                  { label: "followers", val: profile.followers?.length || 0 },
                  { label: "following", val: profile.followings?.length || 0 },
                ].map(s => (
                  <div key={s.label} className="text-center sm:text-left">
                    <p className="text-xl font-black text-white">{s.val}</p>
                    <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 mb-4">
          {[
            { id: "grid",  label: "⊞", text: "Grid"  },
            { id: "posts", label: "☰", text: "Posts" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2
                ${tab === t.id ? "bg-white/20 text-white" : "text-white/40 hover:text-white/70"}`}>
              <span>{t.label}</span><span>{t.text}</span>
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {posts.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center py-20">
            <div className="text-5xl mb-4">🌱</div>
            <p className="text-white/60 font-semibold text-lg">No posts yet</p>
            {isMe && (
              <button onClick={() => setShowModal(true)}
                className="mt-5 px-6 py-2.5 text-sm font-bold text-white rounded-2xl shadow hover:scale-105 transition-all"
                style={{ background: "linear-gradient(135deg,#f43f5e,#a855f7)" }}>
                🌸 Share your first photo
              </button>
            )}
          </div>
        ) : tab === "grid" ? (
          /* ── GRID VIEW — Instagram-style photo grid ── */
          <div className="grid grid-cols-3 gap-0.5 rounded-2xl overflow-hidden">
            {posts.map(p => {
              const postImg = resolveImg(p.img || p.image || p.photo || "");
              return (
                <div key={p._id}
                  className="relative overflow-hidden group bg-white/10 cursor-pointer"
                  style={{ aspectRatio: "1/1" }}>
                  {postImg ? (
                    <img
                      src={postImg}
                      alt="post"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    /* Text-only post placeholder */
                    <div className="w-full h-full flex items-center justify-center p-3"
                      style={{ background: "linear-gradient(135deg,rgba(244,63,94,0.2),rgba(168,85,247,0.2))" }}>
                      <p className="text-xs text-white/60 text-center line-clamp-4 leading-relaxed">
                        {p.desc || "Post"}
                      </p>
                    </div>
                  )}

                  {/* Hover overlay with stats */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-5">
                    <span className="flex items-center gap-1.5 text-white text-sm font-bold">
                      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                        <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
                      </svg>
                      {p.likes?.length || 0}
                    </span>
                    <span className="flex items-center gap-1.5 text-white text-sm font-bold">
                      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                        <path d="M12 2.25c-5.385 0-9.75 3.694-9.75 8.25 0 2.027.786 3.886 2.087 5.301-.136.88-.57 1.955-1.253 2.94a.75.75 0 00.676 1.183c1.754-.172 3.35-.822 4.52-1.523A10.87 10.87 0 0012 18.75c5.384 0 9.75-3.694 9.75-8.25S17.384 2.25 12 2.25z"/>
                      </svg>
                      {p.comments?.length || 0}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── POSTS VIEW ── */
          <div className="space-y-4">
            {posts.map(p => <PostCard key={p._id} post={p} setPosts={setPosts} />)}
          </div>
        )}
      </div>
    </div>
  );
}