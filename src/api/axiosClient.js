// Frontend/src/api/axiosClient.js

import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`,
  withCredentials: true,
});

export default axiosClient;