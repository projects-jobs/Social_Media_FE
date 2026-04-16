// src/api/index.js  ─ all API calls live here
import { API_BASE } from "../config";

const req = async (method, endpoint, body, isForm = false) => {
  const opts = { method, headers: {} };
  if (body) {
    if (isForm) { opts.body = body; }
    else { opts.headers["Content-Type"] = "application/json"; opts.body = JSON.stringify(body); }
  }
  const res  = await fetch(API_BASE + endpoint, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || "Request failed");
  return data;
};

export const API = {
  register:     (d)          => req("POST",   "/auth/register", d),
  login:        (d)          => req("POST",   "/auth/login", d),
  getUser:      (id)         => req("GET",    `/users/${id}`),
  updateUser:   (id, d)      => req("PUT",    `/users/${id}`, d),
  follow:       (id, userId) => req("PUT",    `/users/${id}/follow`,   { userId }),
  unfollow:     (id, userId) => req("PUT",    `/users/${id}/unfollow`, { userId }),
  getFriends:   (id)         => req("GET",    `/users/${id}/friends`),
  createPost:   (d)          => req("POST",   "/posts", d),
  updatePost:   (id, d)      => req("PUT",    `/posts/${id}`, d),
  deletePost:   (id, userId) => req("DELETE", `/posts/${id}`, { userId }),
  likePost:     (id, userId) => req("PUT",    `/posts/${id}/like`,    { userId }),
  commentPost:  (id, d)      => req("PUT",    `/posts/${id}/comment`, d),
  getTimeline:  (userId)     => req("GET",    `/posts/timeline/${userId}`),
  getUserPosts: (userId)     => req("GET",    `/posts/profile/${userId}`),
  uploadImage:  (fd)         => req("POST",   "/upload", fd, true),
};