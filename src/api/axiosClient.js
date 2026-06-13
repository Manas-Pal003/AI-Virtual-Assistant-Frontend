// Frontend/src/api/axiosClient.js

import axios from "axios";

const axiosClient = axios.create({
  baseURL: `http://${window.location.hostname}:8000/api`,
  withCredentials: true,
});

export default axiosClient;