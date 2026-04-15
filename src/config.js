// src/config.js
// ── SINGLE SOURCE OF TRUTH ──────────────────────────────────────────────────
// Import this in every file that needs images or API base URL.
// Change the value here once and it updates everywhere.

export const API_BASE  = "http://localhost:5000/api";
export const BASE_IMG  = "http://localhost:5000/images/";

/**
 * Returns the full image URL for a given filename.
 * If filename is empty / null / undefined, returns null.
 *
 * Usage:
 *   import { imgUrl } from "../config";
 *   <img src={imgUrl(post.img)} />
 */
export const imgUrl = (filename) =>
  filename ? `${BASE_IMG}${filename}` : null;

/**
 * Returns a UI-Avatars fallback URL for a given display name.
 * Usage:
 *   import { avatarUrl } from "../config";
 *   <img src={avatarUrl(user.username)} />
 */
export const avatarUrl = (name = "User") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f43f5e&color=fff&bold=true&size=128`;