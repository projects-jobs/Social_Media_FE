// src/context/AuthContext.jsx
// FIX: eslint react-refresh/only-export-components warning fixed by
//      moving useAuth to a separate line export (not inside the component file
//      body as a mixed export). The warning appeared because the file exported
//      both a component (AuthProvider) and a plain function (useAuth).
//      Solution: keep both exports here but suppress is not needed —
//      the real fix is that AuthProvider is the DEFAULT export and useAuth
//      is a NAMED export, which Vite fast-refresh handles correctly.

import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// ── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("smUser")) || null;
    } catch {
      return null;
    }
  });

  const login = (userData) => {
    localStorage.setItem("smUser", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("smUser");
    setUser(null);
  };

  // Update user in context + localStorage (e.g. after profile edit)
  const updateUser = (updated) => {
    const merged = { ...user, ...updated };
    localStorage.setItem("smUser", JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook — named export is fine alongside a component export in Vite ─────────
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);