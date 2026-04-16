// ✅ Import API from api/index.js — NOT from config.js
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API } from "../api/index";
import { useAuth } from "../context/AuthContext";
import { imgUrl, avatarUrl } from "../config";
import Navbar from "../components/Navbar";
import PostCard from "../components/Postcard";
import CreatePostModal from "../components/Createpostmodal";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="flex gap-3 px-4 py-3">
        <div className="w-9 h-9 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 bg-gray-200 rounded w-28" />
          <div className="h-2 bg-gray-100 rounded w-16" />
        </div>
      </div>
      <div className="bg-gray-100" style={{ height: 280 }} />
      <div className="px-4 py-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [posts,     setPosts]     = useState([]);
  const [friends,   setFriends]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [feed, fr] = await Promise.all([
          API.getTimeline(user._id),
          API.getFriends(user._id),
        ]);
        setPosts(feed);
        setFriends(fr);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [user._id]);

  const handleCreated = (post) => setPosts(p => [post, ...p]);

  const avatar = user.profilePicture ? imgUrl(user.profilePicture) : avatarUrl(user.username);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 40%,#0f3460 100%)" }}>
      <Navbar onNewPost={() => setShowModal(true)} />
      {showModal && <CreatePostModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}

      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">

        {/* ── Feed ── */}
        <main className="flex-1 min-w-0 space-y-5">
          {/* Create post bar */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <img src={avatar} alt="me" className="w-10 h-10 rounded-full ring-2 ring-rose-400/40 object-cover shrink-0" />
              <button onClick={() => setShowModal(true)}
                className="flex-1 text-left text-sm text-white/40 bg-white/10 hover:bg-white/20 transition-colors rounded-full px-4 py-2.5 font-medium border border-white/10">
                What's blooming, {user.username}? 🌸
              </button>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-white shadow transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg,#f43f5e,#a855f7)" }}>
                <span className="text-base">📷</span>
                <span className="hidden sm:inline">Photo</span>
              </button>
            </div>
          </div>

          {/* Posts */}
          {loading
            ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
            : posts.length === 0
              ? (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 py-24 text-center">
                  <div className="text-7xl mb-4">🌸</div>
                  <p className="text-xl font-bold text-white">Your garden is empty</p>
                  <p className="text-sm text-white/50 mt-1 mb-6">Follow people or share your first bloom!</p>
                  <button onClick={() => setShowModal(true)}
                    className="px-6 py-3 text-sm font-bold text-white rounded-2xl shadow-lg hover:scale-105 transition-all"
                    style={{ background: "linear-gradient(135deg,#f43f5e,#a855f7)" }}>
                    🌸 Create Your First Post
                  </button>
                </div>
              )
              : posts.map(p => <PostCard key={p._id} post={p} setPosts={setPosts} />)
          }
        </main>

        {/* ── Sidebar ── */}
        <aside className="w-72 shrink-0 hidden lg:block space-y-4">
          {/* Profile card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-4">
            <Link to={`/profile/${user._id}`} className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-full p-0.5 shrink-0"
                style={{ background: "linear-gradient(135deg,#f43f5e,#a855f7)" }}>
                <img src={avatar} alt="me" className="w-full h-full rounded-full object-cover border-2 border-white" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-white group-hover:text-rose-300 transition-colors truncate">
                  {user.username}
                </p>
                <p className="text-xs text-white/40">View your profile →</p>
              </div>
            </Link>
          </div>

          {/* Following */}
          {friends.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-4">
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Following 🌺</p>
              <div className="space-y-3">
                {friends.slice(0, 8).map(f => {
                  const fAv = f.profilePicture ? imgUrl(f.profilePicture) : avatarUrl(f.username);
                  return (
                    <Link key={f._id} to={`/profile/${f._id}`} className="flex items-center gap-3 group">
                      <img src={fAv} alt={f.username}
                        className="w-8 h-8 rounded-full ring-1 ring-rose-400/30 object-cover shrink-0" />
                      <span className="text-sm text-white/80 font-medium truncate group-hover:text-rose-300 transition-colors">
                        {f.username}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-4">
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Quick Links</p>
            <div className="space-y-2">
              <Link to={`/profile/${user._id}`}
                className="flex items-center gap-2 text-sm text-white/60 hover:text-rose-300 transition-colors py-1">
                👤 My Profile
              </Link>
              <Link to="/settings"
                className="flex items-center gap-2 text-sm text-white/60 hover:text-rose-300 transition-colors py-1">
                ⚙️ Settings
              </Link>
            </div>
          </div>

          <p className="text-xs text-white/20 text-center">© 2026 Vibe 🌸 Share your world</p>
        </aside>
      </div>
    </div>
  );
}