import axios from "axios";

const api = axios.create({
  baseURL: "https://gemmaceous-birectangular-sunshine.ngrok-free.dev/api",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "ngrok-skip-browser-warning": "69420",  
  },
});

// Otomatis tempel token di setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
