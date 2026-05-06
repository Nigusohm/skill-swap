import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

type AuthContextType = {
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, school?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "skillswapp_token";

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(TOKEN_KEY);
      if (stored) {
        setToken(stored);
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post("/api/auth/login", { email, password });
    const nextToken = res.data.token as string;
    setToken(nextToken);
    await AsyncStorage.setItem(TOKEN_KEY, nextToken);
  };

  const register = async (name: string, email: string, password: string, school?: string) => {
    const res = await api.post("/api/auth/register", { name, email, password, school });
    const nextToken = res.data.token as string;
    setToken(nextToken);
    await AsyncStorage.setItem(TOKEN_KEY, nextToken);
  };

  const logout = async () => {
    setToken(null);
    await AsyncStorage.removeItem(TOKEN_KEY);
  };

  const value = useMemo(
    () => ({ token, loading, login, register, logout }),
    [token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
};
