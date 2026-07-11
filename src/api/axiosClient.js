// Frontend/src/api/axiosClient.js

import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL
  ? (import.meta.env.VITE_API_URL.endsWith("/api") ? import.meta.env.VITE_API_URL.slice(0, -4) : import.meta.env.VITE_API_URL)
  : `http://${window.location.hostname}:8000`;

const axiosClient = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

export default axiosClient;