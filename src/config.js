// src/config.js  ─ constants only
export const API_BASE = "http://localhost:5000/api";
export const BASE_IMG = "http://localhost:5000/images/";

export const imgUrl   = (f)    => f ? `${BASE_IMG}${f}` : null;
export const avatarUrl= (name = "User") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f43f5e&color=fff&bold=true&size=128`;