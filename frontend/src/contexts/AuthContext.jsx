import React, { createContext, useContext, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("lt_user") || "null")
  );

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const data = res.data;
    setUser(data.user);
    localStorage.setItem("lt_user", JSON.stringify(data.user));
  };

  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    const data = res.data;
    setUser(data.user);
    localStorage.setItem("lt_user", JSON.stringify(data.user));
  };

  const logout = async() => {
    await api.post("/auth/logout");
    setUser(null);
    localStorage.removeItem("lt_user");
  };

  return (
    <AuthContext.Provider value={{user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
