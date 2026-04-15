import { useState, useRef } from "react";
import { API } from "../config";
import { useAuth } from "../context/AuthContext";

export default function CreatePostModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const fileRef = useRef();

  const pickFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
  };

  const submit = async () => {
    if (!desc && !file) return;
    setError(""); setLoading(true);
    try {
      let imgName = "";
      if (file) {
        setProgress("Uploading image…");
        const fd = new FormData();
        const ext = file.name.substring(file.name.lastIndexOf("."));
        const safeName = `post_${user._id}_${Date.now()}${ext}`;
        fd.append("name", safeName);
        fd.append("file", file);
        const up = await API.uploadImage(fd);
        imgName = up.filename;
        setProgress("Creating post…");
      }
      const newPost = await API.createPost({ userId: user._id, desc, img: imgName });
      onCreated({ ...newPost, username: user.username });
      onClose();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); setProgress(""); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        style={{ animation: "slideUp .25s ease-out" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button onClick={onClose} className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
            Cancel
          </button>
          <h2 className="font-bold text-gray-900">Create Post</h2>
          <button onClick={submit} disabled={loading || (!desc && !file)}
            className="text-sm font-bold text-white px-4 py-1.5 rounded-xl disabled:opacity-40 transition-all shadow"
            style={{ background: "linear-gradient(135deg,#f43f5e,#a855f7)" }}>
            {loading ? (progress || "…") : "Share"}
          </button>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => !preview && fileRef.current.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className={`mx-5 mt-5 rounded-2xl border-2 border-dashed transition-colors overflow-hidden
            ${preview ? "border-transparent" : "border-gray-200 hover:border-rose-300 cursor-pointer"}`}
          style={{ minHeight: 220 }}>
          {preview ? (
            <div className="relative">
              <img src={preview} alt="preview" className="w-full max-h-80 object-contain bg-black" />
              <button onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full text-white flex items-center justify-center hover:bg-black/80 transition-colors text-lg leading-none">
                ×
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-gray-400">
              <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#fce7f3,#ede9fe)" }}>
                <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12h.008v.008H13.5V12zm-4.5 0h.008v.008H9V12z"/>
                </svg>
              </div>
              <p className="font-semibold text-sm">Click or drag photo here</p>
              <p className="text-xs mt-1">JPG, PNG, GIF up to 10MB</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={pickFile} />

        {/* Caption */}
        <div className="px-5 py-4">
          <div className="flex gap-3">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=f43f5e&color=fff&bold=true`}
              className="w-9 h-9 rounded-full shrink-0" alt="me" />
            <textarea value={desc} onChange={e => setDesc(e.target.value)}
              placeholder={`What's on your mind, ${user.username}?`}
              rows={3}
              className="flex-1 text-sm resize-none outline-none text-gray-700 placeholder-gray-400 border border-gray-100 rounded-2xl p-3 focus:ring-2 focus:ring-rose-100 focus:border-rose-200 transition-all" />
          </div>
        </div>

        {error && <p className="px-5 pb-4 text-sm text-red-500 font-medium">⚠️ {error}</p>}
      </div>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}