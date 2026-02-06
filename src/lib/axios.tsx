import axios from "axios";

const api = axios.create({
  // Jika menjalankan Laravel di komputer yang sama (Localhost)
  // Gunakan http://127.0.0.1:8000 atau IP laptop Anda
  baseURL: "https://gemmaceous-birectangular-sunshine.ngrok-free.dev/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "multipart/form-data", // Penting untuk upload foto
    'ngrok-skip-browser-warning': true, 
  },
});

export default api;
