import axios from "axios";

// Reads from .env (dev) or .env.production (build)
// VITE_API_URL=https://localhost:7042/api  ← your .env
// VITE_API_URL=https://skyroute.runasp.net/api  ← your .env.production
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// 🔹 REQUEST: Attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔥 RESPONSE: Auto logout on session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expired. Logging out...");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;



// import axios from "axios";

// const API_URL = "https://localhost:7042/api";
// // const API_URL = "https://skyroute.runasp.net/api";

// const api = axios.create({
//   baseURL: API_URL,
// });

// // 🔹 REQUEST: Attach JWT
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // 🔥 RESPONSE: Auto logout on session expiry
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       console.warn("Session expired. Logging out...");

//       localStorage.removeItem("token");

//       // Force redirect (outside React context)
//       window.location.href = "/login";
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;
