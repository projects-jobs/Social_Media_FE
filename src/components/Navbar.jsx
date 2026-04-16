// ✅ Navbar — NO API import needed here
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { imgUrl, avatarUrl } from "../config";

export default function Navbar({ onNewPost }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); nav("/auth"); };

  const avatar = user?.profilePicture ? imgUrl(user.profilePicture) : avatarUrl(user?.username);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🌸</span>
          <span className="text-xl font-black text-gray-900 hidden sm:block" style={{ fontFamily: "Georgia,serif" }}>Blossom</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xs hidden md:block">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input placeholder="Search Blossom...."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-rose-200 transition-all" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={onNewPost}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-white rounded-xl shadow hover:shadow-md hover:scale-105 active:scale-95 transition-all"
            style={{ background: "linear-gradient(135deg,#f43f5e,#a855f7)" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
            </svg>
            <span className="hidden sm:inline">New Post</span>
          </button>

          {/* Avatar dropdown */}
          <div className="relative">
            <button onClick={() => setMenuOpen(o => !o)}
              className="w-9 h-9 rounded-full ring-2 ring-rose-200 hover:ring-rose-400 overflow-hidden transition-all">
              <img src={avatar} alt="me" className="w-full h-full object-cover" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-11 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="font-bold text-sm text-gray-900 truncate">{user?.username}</p>
                  </div>
                  <Link to={`/profile/${user?._id}`} onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    👤 My Profile
                  </Link>
                  <Link to="/settings" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    ⚙️ Settings
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    🚪 Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}