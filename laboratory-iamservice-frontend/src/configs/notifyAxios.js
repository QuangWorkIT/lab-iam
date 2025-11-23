import axios from "axios";

export const notifyApi = axios.create({
  baseURL: import.meta.env.VITE_NOTIFY_URL,
  withCredentials: true
});