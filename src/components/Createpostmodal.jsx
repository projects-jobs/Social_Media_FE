// ✅ Import API from api/index.js
import { useState, useRef } from "react";
import { API } from "../API/index";
import { useAuth } from "../context/AuthContext";
import { avatarUrl } from "../config";


export default function CreatePostModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const [desc,     setDesc]     = useState("");
  const [file,     setFile]     = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [progress, setProgress] = useState("");
  const fileRef = useRef();

  const pickFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f); setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
  };

  const submit = async () => {
    if (!desc.trim() && !file) { setError("Add a photo or write something!"); return; }
    setError(""); setLoading(true);
    try {
      let imgFilename = "";

      if (file) {
        setProgress("Uploading image…");
        const fd  = new FormData();
        const ext = file.name.includes(".") ? file.name.substring(file.name.lastIndexOf(".")) : ".jpg";
        const safeName = `post_${user._id}_${Date.now()}${ext}`;
        fd.append("name", safeName);
        fd.append("file", file);

        console.log("Uploading file:", safeName);
        const up = await API.uploadImage(fd);
        console.log("Upload response:", up);

        // ✅ Handle both response shapes: { filename } or { fileName }
        imgFilename = up.filename || up.fileName || up.name || safeName;
        setProgress("Creating post…");
      }

      console.log("Creating post with img:", imgFilename);
      const newPost = await API.createPost({
        userId: user._id,
        desc:   desc.trim(),
        img:    imgFilename,
      });

      console.log("Post created:", newPost);

      // ✅ Merge username + full image URL into the returned post so PostCard renders immediately
      onCreated({
        ...newPost,
        username: user.username,
        img: imgFilename,                         // ensure img is set even if backend omits it
      });
      onClose();
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message);
    } finally { setLoading(false); setProgress(""); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        style={{ animation: "slideUp .25s ease-out" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button onClick={onClose} className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
          <h2 className="font-bold text-gray-900 flex items-center gap-2">🌸 Create Post</h2>
          <button onClick={submit} disabled={loading || (!desc.trim() && !file)}
            className="text-sm font-bold text-white px-5 py-2 rounded-xl disabled:opacity-40 shadow transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg,#f43f5e,#a855f7)" }}>
            {loading ? (progress || "…") : "Share"}
          </button>
        </div>

        {/* Caption input — ABOVE image */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex gap-3">
            <img src={avatarUrl(user.username)} className="w-10 h-10 rounded-full shrink-0" alt="me" />
            <textarea value={desc} onChange={e => setDesc(e.target.value)}
              placeholder={`What's on your mind, ${user.username}?`} rows={3}
              className="flex-1 text-sm resize-none outline-none text-gray-700 placeholder-gray-400 border border-gray-100 rounded-2xl p-3 focus:ring-2 focus:ring-rose-100 focus:border-rose-200 transition-all" />
          </div>
        </div>

        {/* Image drop zone — BELOW caption */}
        <div
          onClick={() => !preview && fileRef.current.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className={`mx-5 mb-5 rounded-2xl border-2 border-dashed transition-all overflow-hidden
            ${preview ? "border-transparent" : "border-gray-200 hover:border-rose-300 cursor-pointer bg-gray-50 hover:bg-rose-50/30"}`}
          style={{ minHeight: preview ? 0 : 140 }}>
          {preview ? (
            <div className="relative bg-black">
              <img src={preview} alt="preview"
                className="w-full block"
                style={{ maxHeight: "400px", objectFit: "contain" }} />
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full text-white text-xl font-light flex items-center justify-center hover:bg-black/80 transition-colors leading-none">
                ×
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <div className="text-4xl mb-2">🌻</div>
              <p className="font-semibold text-sm text-gray-500">Click or drag a photo here</p>
              <p className="text-xs mt-1 text-gray-400">JPG, PNG, GIF up to 10 MB</p>
            </div>
          )}
        </div>

        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={pickFile} />
        {error && <p className="px-5 pb-5 text-sm text-red-500 font-medium">⚠️ {error}</p>}
      </div>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}