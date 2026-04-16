
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../API/index";
import { useAuth } from "../context/AuthContext";
import { imgUrl, avatarUrl } from "../config";
import Navbar from "../components/Navbar";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: user.username, email: user.email, password: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");
  const fileRef = useRef();

  const handle  = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const pickFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f); setPreview(URL.createObjectURL(f));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      let profilePicture = user.profilePicture;
      if (file) {
        const fd  = new FormData();
        const ext = file.name.substring(file.name.lastIndexOf("."));
        fd.append("name", `avatar_${user._id}_${Date.now()}${ext}`);
        fd.append("file", file);
        const up  = await API.uploadImage(fd);
        profilePicture = up.filename;
      }
      const updates = { userId: user._id, username: form.username, email: form.email, profilePicture };
      if (form.password) updates.password = form.password;
      const updated = await API.updateUser(user._id, updates);
      updateUser({ ...updated, profilePicture });
      setSuccess("Profile updated ✅");
      setForm(f => ({ ...f, password: "" }));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const avatar = preview || (user.profilePicture ? imgUrl(user.profilePicture) : avatarUrl(user.username));

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 40%,#0f3460 100%)" }}>
      <Navbar onNewPost={() => {}} />
      <div className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-black text-white mb-6">⚙️ Edit Profile</h1>

        {/* Avatar card */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 mb-4 flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-28 h-28 rounded-full p-0.5" style={{ background: "linear-gradient(135deg,#f43f5e,#a855f7)" }}>
              <img src={avatar} alt="avatar" className="w-full h-full rounded-full object-cover border-2 border-white" />
            </div>
            <button onClick={() => fileRef.current.click()}
              className="absolute bottom-1 right-1 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border-2 border-gray-100">
              📷
            </button>
          </div>
          <button onClick={() => fileRef.current.click()} className="text-sm font-bold text-rose-300 hover:text-rose-200 transition-colors">
            Change Photo
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />
        </div>

        {success && <div className="mb-4 px-4 py-3 bg-green-500/20 border border-green-500/30 rounded-2xl text-sm text-green-300 font-medium">{success}</div>}
        {error   && <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-2xl text-sm text-red-300 font-medium">{error}</div>}

        <form onSubmit={submit} className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 space-y-5">
          {[
            { name: "username", label: "Username", type: "text",  placeholder: "yourname" },
            { name: "email",    label: "Email",    type: "email", placeholder: "you@email.com" },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">{f.label}</label>
              <input name={f.name} type={f.type} value={form[f.name]} onChange={handle} placeholder={f.placeholder}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/10 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 outline-none text-sm text-white placeholder-white/30 transition-all" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">
              New Password <span className="normal-case font-normal text-white/30">(leave blank to keep)</span>
            </label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••"
              className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/10 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 outline-none text-sm text-white placeholder-white/30 transition-all" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => nav(-1)}
              className="flex-1 py-3 rounded-2xl border border-white/20 text-sm font-semibold text-white/70 hover:bg-white/10 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-2xl text-sm font-bold text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#f43f5e,#a855f7)" }}>
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}