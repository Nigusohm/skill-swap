import axios from "axios";

const DEFAULT_API_URL = "https://skillswapp-xz6d.onrender.com";

export const apiBaseUrl = (process.env.EXPO_PUBLIC_API_URL?.trim() || DEFAULT_API_URL).replace(/\/+$/, "");

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000
});

export const withAuth = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`
  }
});
