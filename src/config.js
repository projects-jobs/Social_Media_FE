// src/config.js  ─ constants only
export const API_BASE = "https://social-media-be-jzvd.onrender.com/api";
export const BASE_IMG = "https://social-media-be-jzvd.onrender.com/images/";

export const imgUrl   = (f)    => f ? `${BASE_IMG}${f}` : null;
export const avatarUrl= (name = "User") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f43f5e&color=fff&bold=true&size=128`;