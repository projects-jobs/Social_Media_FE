import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../config";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const BASE_IMG = "http://localhost:5000/images/";

export default function SettingsPage() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: user.username, email: user.email, password: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

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
        const fd = new FormData();
        const ext = file.name.substring(file.name.lastIndexOf("."));
        const safeName = `avatar_${user._id}_${Date.now()}${ext}`;
        fd.append("name", safeName);
        fd.append("file", file);
        const up = await API.uploadImage(fd);
        profilePicture = up.filename;
      }
      const updates = { userId: user._id, username: form.username, email: form.email, profilePicture };
      if (form.password) updates.password = form.password;
      const updated = await API.updateUser(user._id, updates);
      login({ ...user, ...updated, profilePicture });
      setSuccess("Profile updated successfully! ✅");
      setForm(f => ({ ...f, password: "" }));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const avatar = preview
    || (user.profilePicture ? `${BASE_IMG}${user.profilePicture}` : null)
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=f43f5e&color=fff&bold=true&size=128`;

  return (
    <div className="min-h-screen" style={{ background: "#f0f2f5" }}>
      <Navbar onNewPost={() => {}} />
      <div className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-black text-gray-900 mb-6">Edit Profile</h1>

        {/* Avatar */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 mb-4 flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-28 h-28 rounded-full p-0.5 shadow-xl"
              style={{ background: "linear-gradient(135deg,#f43f5e,#a855f7)" }}>
              <img src={avatar} alt="avatar" className="w-full h-full rounded-full object-cover border-2 border-white" />
            </div>
            <button onClick={() => fileRef.current.click()}
              className="absolute bottom-1 right-1 w-9 h-9 bg-white rounded-full shadow-lg border-2 border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </button>
          </div>
          <button onClick={() => fileRef.current.click()} className="text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors">
            Change Profile Photo
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />
        </div>

        {success && <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-2xl text-sm text-green-700 font-medium">{success}</div>}
        {error   && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 font-medium">{error}</div>}

        <form onSubmit={submit} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-5">
          {[
            { name: "username", label: "Username", type: "text", placeholder: "yourname" },
            { name: "email",    label: "Email",    type: "email", placeholder: "you@email.com" },
          ].map(f => (
            <div key={f.name}>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">{f.label}</label>
              <input name={f.name} type={f.type} value={form[f.name]} onChange={handle} placeholder={f.placeholder}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-sm transition-all" />
            </div>
          ))}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
              New Password <span className="font-normal normal-case text-gray-400">(leave blank to keep current)</span>
            </label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••"
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none text-sm transition-all" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => nav(-1)}
              className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
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