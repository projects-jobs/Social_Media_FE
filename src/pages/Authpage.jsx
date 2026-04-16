// ✅ Import API from api/index.js — NOT from config.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../API/index";
import { useAuth } from "../context/AuthContext";

// Decorative flower SVG component
function FlowerBlob({ style, color1, color2 }) {
  return (
    <div className="absolute pointer-events-none select-none" style={style}>
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <linearGradient id={`g${color1}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color1} stopOpacity="0.7"/>
            <stop offset="100%" stopColor={color2} stopOpacity="0.5"/>
          </linearGradient>
        </defs>
        <path fill={`url(#g${color1})`}
          d="M100,20 C110,5 130,5 135,20 C145,10 160,15 158,30 C172,28 178,42 168,50
             C180,55 178,72 165,73 C172,85 162,97 150,93 C148,108 133,113 125,103
             C118,115 100,115 100,100 C100,115 82,115 75,103 C67,113 52,108 50,93
             C38,97 28,85 35,73 C22,72 20,55 32,50 C22,42 28,28 42,30
             C40,15 55,10 65,20 C70,5 90,5 100,20Z"
          transform="scale(0.9) translate(10,10)"
        />
      </svg>
    </div>
  );
}

export default function AuthPage() {
  const [mode, setMode]       = useState("login");
  const [form, setForm]       = useState({ username: "", email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const data = mode === "login"
        ? await API.login({ email: form.email, password: form.password })
        : await API.register(form);
      login(data); nav("/");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left: decorative panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{ background: "linear-gradient(145deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)" }}>

        {/* Animated flower blobs */}
        <FlowerBlob style={{ width:320, height:320, top:"-60px", left:"-80px", animation:"spin 20s linear infinite" }} color1="#f43f5e" color2="#ec4899" />
        <FlowerBlob style={{ width:260, height:260, bottom:"-40px", right:"-60px", animation:"spin 25s linear infinite reverse" }} color1="#a855f7" color2="#6366f1" />
        <FlowerBlob style={{ width:180, height:180, top:"40%", right:"10%", animation:"spin 15s linear infinite" }} color1="#f59e0b" color2="#f43f5e" />
        <FlowerBlob style={{ width:140, height:140, bottom:"20%", left:"10%", animation:"spin 18s linear infinite reverse" }} color1="#10b981" color2="#06b6d4" />

        {/* Floating flower icons */}
        <div className="absolute inset-0 flex flex-wrap gap-8 p-10 opacity-10">
          {[...Array(24)].map((_, i) => (
            <span key={i} className="text-4xl select-none"
              style={{ animation: `float ${3 + (i % 4)}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}>
              {["🌸","🌺","🌼","🌻","🌹","💐"][i % 6]}
            </span>
          ))}
        </div>

        {/* Center content */}
        <div className="relative z-10 text-center text-white px-10">
          <div className="text-8xl mb-6 drop-shadow-2xl" style={{ filter: "drop-shadow(0 0 20px rgba(244,63,94,0.5))" }}>🌸</div>
          <h1 className="text-5xl font-black mb-3 tracking-tight"
            style={{ fontFamily: "Georgia, serif", textShadow: "0 0 30px rgba(244,63,94,0.4)" }}>
            Vibe
          </h1>
          <p className="text-lg text-white/70 font-light mb-8">Share your beautiful moments</p>
          <div className="flex justify-center gap-4 flex-wrap">
            {["🌸 Photos","🌺 Stories","🌼 Connect","🌻 Explore"].map(t => (
              <span key={t} className="px-3 py-1.5 text-sm bg-white/10 backdrop-blur rounded-full text-white/80 border border-white/20">
                {t}
              </span>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        `}</style>
      </div>

      {/* ── Right: form panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-rose-50 via-white to-purple-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="text-6xl mb-2">🌸</div>
            <h1 className="text-3xl font-black text-gray-900" style={{ fontFamily: "Georgia,serif" }}>Vibe</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-rose-100/60 p-8 border border-rose-100/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {mode === "login" ? "Welcome back 👋" : "Join Vibe 🌸"}
            </h2>
            <p className="text-sm text-gray-400 mb-7">
              {mode === "login" ? "Sign in to your account" : "Create your free account"}
            </p>

            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Username</label>
                  <input name="username" value={form.username} onChange={handle} placeholder="yourname" required
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-sm transition-all" />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@email.com" required
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input name="password" type={showPw ? "text" : "password"} value={form.password} onChange={handle} placeholder="••••••••" required
                    className="w-full px-4 py-3 pr-10 rounded-2xl bg-gray-50 border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-sm transition-all" />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 mt-2"
                style={{ background: "linear-gradient(135deg,#f43f5e 0%,#ec4899 50%,#a855f7 100%)" }}>
                {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              {mode === "login" ? "New to Vibe? " : "Already have an account? "}
              <button onClick={() => { setMode(m => m === "login" ? "register" : "login"); setError(""); }}
                className="text-rose-500 font-bold hover:text-rose-600 transition-colors">
                {mode === "login" ? "Sign up free 🌸" : "Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}