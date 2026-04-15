import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../config";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const [mode, setMode]     = useState("login");
  const [form, setForm]     = useState({ username: "", email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
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
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{ background: "linear-gradient(135deg, #f43f5e 0%, #ec4899 40%, #a855f7 100%)" }}>
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 80 + 20,
                height: Math.random() * 80 + 20,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.1,
              }}
            />
          ))}
        </div>
        <div className="relative text-center text-white px-10 z-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center shadow-2xl">
            <svg className="w-11 h-11 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
          <h1 className="text-5xl font-black mb-4 tracking-tight">Vibe</h1>
          <p className="text-xl text-white/80 font-light">Share moments. Connect with the world.</p>
          <div className="mt-12 grid grid-cols-3 gap-2 opacity-60">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-white/20 backdrop-blur" />
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#fafafa]">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-xl shadow-rose-100/50 p-8 border border-gray-100">
            {/* Logo (mobile) */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-500 items-center justify-center mb-3 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4 0-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <h1 className="text-3xl font-black text-gray-900">Vibe</h1>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {mode === "login" ? "Welcome back 👋" : "Join Vibe 🎉"}
            </h2>
            <p className="text-sm text-gray-400 mb-7">
              {mode === "login" ? "Sign in to your account" : "Create your account today"}
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Username</label>
                  <input name="username" value={form.username} onChange={handle} placeholder="yourname" required
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:border-rose-400 focus:ring-3 focus:ring-rose-100 outline-none text-sm transition-all" />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Email</label>
                <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@email.com" required
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:border-rose-400 focus:ring-3 focus:ring-rose-100 outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Password</label>
                <input name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" required
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:border-rose-400 focus:ring-3 focus:ring-rose-100 outline-none text-sm transition-all" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg shadow-rose-200 hover:shadow-rose-300 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #f43f5e 0%, #ec4899 60%, #a855f7 100%)" }}>
                {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                {mode === "login" ? "New to Vibe? " : "Already have an account? "}
                <button onClick={() => { setMode(m => m === "login" ? "register" : "login"); setError(""); }}
                  className="text-rose-500 font-bold hover:text-rose-600 transition-colors">
                  {mode === "login" ? "Sign up free" : "Sign in"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}