import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API } from "../config";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import PostCard from "../components/Postcard";
import CreatePostModal from "../components/Createpostmodal";

const BASE_IMG = "http://localhost:5000/images/";

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
      <div className="bg-gray-100" style={{ height: 300 }} />
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

  const avatar = user.profilePicture
    ? `${BASE_IMG}${user.profilePicture}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=f43f5e&color=fff&bold=true`;

  return (
    <div className="min-h-screen" style={{ background: "darkslategrey" }}>
      <Navbar onNewPost={() => setShowModal(true)} />
      {showModal && <CreatePostModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}

      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">

        {/* ── Feed (main) ── */}
        <main className="flex-1 min-w-0 space-y-5">
          {/* Create post bar */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <img src={avatar} alt="me" className="w-10 h-10 rounded-full ring-2 ring-rose-100 object-cover shrink-0" />
              <button onClick={() => setShowModal(true)}
                className="flex-1 text-left text-sm text-gray-400 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-4 py-2.5 font-medium">
                What's on your mind, {user.username}?
              </button>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-white shadow transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg,#f43f5e,#a855f7)" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span className="hidden sm:inline">Photo</span>
              </button>
            </div>
          </div>

          {/* Posts */}
          {loading
            ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
            : posts.length === 0
              ? (
                <div className="bg-white rounded-2xl border border-gray-200 py-24 text-center shadow-sm">
                  <div className="text-6xl mb-4">📸</div>
                  <p className="text-lg font-bold text-gray-700">Your feed is empty</p>
                  <p className="text-sm text-gray-400 mt-1 mb-6">Follow people or share your first post!</p>
                  <button onClick={() => setShowModal(true)}
                    className="px-6 py-3 text-sm font-bold text-white rounded-2xl shadow-lg hover:scale-105 transition-all"
                    style={{ background: "linear-gradient(135deg,#f43f5e,#a855f7)" }}>
                    Create Your First Post
                  </button>
                </div>
              )
              : posts.map(p => <PostCard key={p._id} post={p} setPosts={setPosts} />)
          }
        </main>

        {/* ── Sidebar ── */}
        <aside className="w-72 shrink-0 hidden lg:block space-y-4">
          {/* Profile card — NO email shown */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <Link to={`/profile/${user._id}`} className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-full p-0.5 shrink-0"
                style={{ background: "linear-gradient(135deg,#f43f5e,#a855f7)" }}>
                <img src={avatar} alt="me"
                  className="w-full h-full rounded-full object-cover border-2 border-white" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-gray-900 group-hover:text-rose-500 transition-colors truncate">
                  {user.username}
                </p>
                <p className="text-xs text-gray-400">View your profile →</p>
              </div>
            </Link>
          </div>

          {/* Following list */}
          {friends.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Following</p>
              <div className="space-y-3">
                {friends.slice(0, 8).map(f => {
                  const fAvatar = f.profilePicture
                    ? `${BASE_IMG}${f.profilePicture}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(f.username)}&background=f43f5e&color=fff&bold=true`;
                  return (
                    <Link key={f._id} to={`/profile/${f._id}`}
                      className="flex items-center gap-3 group">
                      <img src={fAvatar} alt={f.username}
                        className="w-8 h-8 rounded-full ring-1 ring-rose-100 object-cover shrink-0" />
                      <span className="text-sm text-gray-800 font-medium truncate group-hover:text-rose-500 transition-colors">
                        {f.username}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggested - placeholder */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Links</p>
            <div className="space-y-2">
              <Link to={`/profile/${user._id}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-500 transition-colors py-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                My Profile
              </Link>
              <Link to="/settings"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-500 transition-colors py-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Settings
              </Link>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center px-2">© 2026 Vibe · Made with ❤️</p>
        </aside>
      </div>
    </div>
  );
}