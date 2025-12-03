import axios from "axios";
import { login, logout } from "../redux/features/userSlice";
import { parseClaims } from '../utils/jwtUtil.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token && !config.url.includes("login")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// auto refresh token
let refreshSubcribers = []
let isRefreshing = false

const onRefreshed = (newAccessToken) => {
  refreshSubcribers.forEach(cb => cb(newAccessToken))
  refreshSubcribers = []
}

const addSubscriber = (callBack) => {
  refreshSubcribers.push(callBack)
}

// add response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originRequest = error.config

    if (error.response.status === 401
      && error.response.data?.error === "JWT invalid or expired"
      && !originRequest._retry

    ) {
      // try only 1 refresh
      originRequest._retry = true

      // add request to queue if it is refreshing and wait for new token
      if (isRefreshing) {
        return new Promise((resolve) => {
          addSubscriber((newAccessToken) => {
            originRequest.headers.Authorization = `Bearer ${newAccessToken}`
            resolve(api(originRequest))
          })
        })
      }

      isRefreshing = true

      try {
        const response = await api.post("/api/auth/refresh")
        const data = response.data.data
        const { store } = await import('../redux/store.js') // delay import preventing import circular error

        // relogin user with new token
        const payload = parseClaims(data.accessToken)
        store.dispatch(login({
          token: data.accessToken,
          userInfo: {
            id: payload.sub,
            userName: payload.userName,
            email: payload.email,
            role: payload.role,
            privileges: payload.privileges,
          }
        }))

        // execute waiting requests
        onRefreshed(data.accessToken)
        console.log("refresh")
        originRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originRequest)
      } catch (error) {
        const { store } = await import('../redux/store.js') // delay import

        // logout if refresh is failed
        store.dispatch(() => logout())
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    // reject error if not 401
    return Promise.reject(error)
  }
)
export default api;
