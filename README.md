# 🌸 Vibe Frontend

A beautiful Instagram-like social media frontend built with React, Vite, and Tailwind CSS.

## Tech Stack

- **React 18** — UI library
- **React Router v6** — client-side routing
- **Tailwind CSS** — utility-first styling
- **Vite** — lightning-fast dev server

## Project Structure

```
src/
├── api/
│   └── index.js          ← All API calls (import API from here)
├── config.js             ← Constants: API_BASE, BASE_IMG, helpers
├── context/
│   └── AuthContext.jsx   ← Auth state (user, login, logout, updateUser)
├── components/
│   ├── Navbar.jsx
│   ├── PostCard.jsx
│   ├── CreatePostModal.jsx
│   └── ProtectedRoute.jsx
└── pages/
    ├── AuthPage.jsx      ← Login / Register
    ├── HomePage.jsx      ← Feed + Sidebar
    ├── ProfilePage.jsx   ← User profile (grid + post tabs)
    └── SettingsPage.jsx  ← Edit profile + change avatar
```

## ⚠️ Critical Import Rule

**Always import `API` from `../api/index` — NEVER from `../config`.**

```js
// ✅ CORRECT
import { API } from "../api/index";

// ❌ WRONG — config.js does not export API
import { API } from "../config";
```

`config.js` exports only: `API_BASE`, `BASE_IMG`, `imgUrl()`, `avatarUrl()`

## Setup

```bash
npm install
npm run dev
```

Frontend runs on **http://localhost:3000**

Make sure the backend is running on **http://localhost:5000** first.

## Features

- 🔐 Register / Login with form validation
- 🏠 Home feed with skeleton loading
- 📸 Create post with image upload (drag & drop supported)
- ❤️ Like / Unlike posts
- 💬 Comment on posts (shows username immediately)
- ✏️ Edit / Delete your own posts
- 👤 Profile page with grid & post tabs
- 👥 Follow / Unfollow users
- ⚙️ Edit profile + change avatar
- 📱 Fully responsive (mobile → desktop)

## Environment

No `.env` file needed. All URLs are in `src/config.js`:

```js
export const API_BASE = "http://localhost:5000/api";
export const BASE_IMG = "http://localhost:5000/images/";
```

Change these if your backend runs on a different port.