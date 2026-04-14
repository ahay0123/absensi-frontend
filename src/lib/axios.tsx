import axios from "axios";

const api = axios.create({
  baseURL: "https://gemmaceous-birectangular-sunshine.ngrok-free.dev/api",
  withCredentials: true,
  timeout: 30000, // 30 second timeout (increased from 15s)
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "69420",
  },
});

// Otomatis tempel token di setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Log request
  console.log(`📤 [${config.method?.toUpperCase()}] ${config.url}`);
  return config;
});

// Otomatis handle token expired (401 Unauthorized) dan logging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ [${response.status}] ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    console.error(`❌ [${status}] ${url}`, {
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data,
    });

    // Handle 401 Unauthorized
    if (status === 401) {
      console.warn(
        "🔐 Token expired - clearing storage and redirecting to login",
      );
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    // Log 500 errors untuk debugging
    if (status === 500) {
      console.error(
        "🔴 Server Internal Error (500). Backend sedang bermasalah.",
      );
    }

    return Promise.reject(error);
  },
);

export default api;
