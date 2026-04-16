import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("smUser")) || null; }
    catch { return null; }
  });

  const login      = (u) => { localStorage.setItem("smUser", JSON.stringify(u)); setUser(u); };
  const logout     = ()  => { localStorage.removeItem("smUser"); setUser(null); };
  const updateUser = (u) => { const m = { ...user, ...u }; localStorage.setItem("smUser", JSON.stringify(m)); setUser(m); };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);