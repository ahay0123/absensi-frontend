/**
 * Ngrok-Specific Validation & Setup Hook
 * Handle ngrok tunnel status, URL changes, dan connectivity issues
 * Penting untuk ngrok users yang backend URL bisa berubah/expired
 */

import { useEffect, useState, useCallback, useRef } from "react";
import api from "./axios";

interface NgrokStatus {
  isConnected: boolean;
  urlValid: boolean;
  lastChecked: number;
  error?: string;
}

interface NgrokConfig {
  checkIntervalMs: number;
  timeoutMs: number;
  retryAttempts: number;
}

const DEFAULT_NGROK_CONFIG: NgrokConfig = {
  checkIntervalMs: 30000, // Check every 30 seconds
  timeoutMs: 5000,
  retryAttempts: 3,
};

/**
 * Hook untuk monitor ngrok connectivity
 * Deteksi kalau ngrok tunnel down atau URL berubah
 */
export function useNgrokMonitoring(config: Partial<NgrokConfig> = {}) {
  const finalConfig = { ...DEFAULT_NGROK_CONFIG, ...config };
  const [ngrokStatus, setNgrokStatus] = useState<NgrokStatus>({
    isConnected: true,
    urlValid: true,
    lastChecked: 0,
  });

  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUrlRef = useRef<string>("");

  const checkNgrokConnectivity = useCallback(async () => {
    try {
      // Get current base URL dari axios
      const currentUrl = api.defaults.baseURL;

      // Detect kalau URL berubah (ngrok restart)
      if (lastUrlRef.current && lastUrlRef.current !== currentUrl) {
        console.warn("🚨 [Ngrok] Base URL changed!", {
          old: lastUrlRef.current,
          new: currentUrl,
          possibleCause: "Ngrok tunnel restarted or changed",
        });

        setNgrokStatus({
          isConnected: false,
          urlValid: false,
          lastChecked: Date.now(),
          error: "Ngrok URL berubah - tunnel mungkin di-restart",
        });

        return;
      }

      // Only track URL if it's defined
      if (currentUrl) {
        lastUrlRef.current = currentUrl;
      }

      // Test connectivity dengan health check endpoint
      // Gunakan endpoint yang paling simple/fast
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        finalConfig.timeoutMs,
      );

      try {
        const response = await api.get("/schedules", {
          signal: controller.signal,
          // Gunakan timeout dari axios config
        });

        clearTimeout(timeoutId);

        setNgrokStatus({
          isConnected: true,
          urlValid: true,
          lastChecked: Date.now(),
        });

        console.log("✅ [Ngrok] Connected & responsive");
      } catch (err: any) {
        throw err;
      }
    } catch (error: any) {
      const errorCode = error?.code;
      const isTimeout =
        errorCode === "ECONNABORTED" || error?.message?.includes("timeout");

      setNgrokStatus({
        isConnected: false,
        urlValid: false,
        lastChecked: Date.now(),
        error: isTimeout
          ? "Ngrok tidak merespons (timeout)"
          : `Gagal terhubung ke ngrok: ${error?.message}`,
      });

      console.error("❌ [Ngrok] Connectivity check failed:", {
        error: error?.message,
        code: errorCode,
        timestamp: new Date().toISOString(),
      });
    }
  }, [finalConfig.timeoutMs]);

  // Setup monitoring interval
  useEffect(() => {
    // Check immediately
    checkNgrokConnectivity();

    // Then check periodically
    checkTimeoutRef.current = setInterval(
      checkNgrokConnectivity,
      finalConfig.checkIntervalMs,
    );

    return () => {
      if (checkTimeoutRef.current) {
        clearInterval(checkTimeoutRef.current);
      }
    };
  }, [checkNgrokConnectivity, finalConfig.checkIntervalMs]);

  const manualCheck = useCallback(async () => {
    console.log("🔄 [Ngrok] Manual connectivity check...");
    await checkNgrokConnectivity();
  }, [checkNgrokConnectivity]);

  return {
    status: ngrokStatus,
    manualCheck,
    isHealthy: ngrokStatus.isConnected && ngrokStatus.urlValid,
  };
}

/**
 * Hook untuk handle ngrok-specific error recovery
 * Suggest steps kepada user kalau ngrok issue
 */
export function useNgrokErrorRecovery() {
  const getRecoverySteps = (error: any) => {
    const errorCode = error?.code;
    const status = error?.response?.status;

    // Network/Connection errors
    if (errorCode === "ERR_NETWORK" || errorCode === "ECONNABORTED") {
      return {
        title: "Koneksi ke Backend Terputus",
        steps: [
          "1. Pastikan ngrok tunnel masih berjalan di terminal backend",
          "2. Check apakah URL ngrok sudah berubah (URL baru di terminal ngrok)",
          "3. Jika URL berubah, update API_URL di .env.local frontend",
          "4. Restart development server frontend (Ctrl+C lalu npm run dev)",
          "5. Clear browser cache: Ctrl+Shift+Delete",
        ],
        moreInfo:
          "Ngrok tunnel sering di-restart atau session baru dimulai setelah beberapa saat inaktif",
      };
    }

    // 401 - Token issues
    if (status === 401) {
      return {
        title: "Masalah Autentikasi",
        steps: [
          "1. Logout berdasarkan tombol logout yang tersedia",
          "2. Login kembali ke aplikasi",
          "3. Refresh halaman setelah login sukses",
          "4. Jika masih error, coba clear localStorage: F12 > Storage > Clear semua",
        ],
        moreInfo: "Token mungkin expired atau tidak valid di ngrok environment",
      };
    }

    // 404 - Schedule not found (authorization issue)
    if (status === 404) {
      return {
        title: "Data Tidak Ditemukan atau Tidak Ada Akses",
        steps: [
          "1. Pastikan Anda login dengan user yang tepat",
          "2. Pastikan jadwal masih tersedia (belum dihapus)",
          "3. Pastikan jadwal milik user yang login (bukan guru/user lain)",
          "4. Hubungi admin untuk verifikasi data & permissions",
        ],
        moreInfo:
          "Backend sudah di-fix dengan authorization check, tapi perlu verifikasi di ngrok",
      };
    }

    // 500 - Server error
    if (status >= 500) {
      return {
        title: "Error di Backend Server",
        steps: [
          "1. Check terminal backend (ngrok) untuk error messages",
          "2. Cek Laravel logs: storage/logs/laravel.log",
          "3. Clear Laravel cache: php artisan cache:clear",
          "4. Jika perlu, restart Laravel server",
          "5. Restart ngrok tunnel",
        ],
        moreInfo:
          "Butuh debug di backend - check server logs untuk detail error",
      };
    }

    // Unknown/Timeout
    return {
      title: "Terjadi Kesalahan Umum",
      steps: [
        "1. Periksa koneksi internet Anda",
        "2. Refresh halaman browser",
        "3. Jika masih error, coba beberapa saat kemudian",
        "4. Hubungi admin dengan info detail error",
      ],
      moreInfo: "Error details sudah dicatat di console browser (F12)",
    };
  };

  return { getRecoverySteps };
}

/**
 * Utility untuk log ngrok-related debugging info
 * Useful untuk production debugging
 */
export function logNgrokDebugInfo(context: string, data: any) {
  const timestamp = new Date().toISOString();
  const baseUrl = api.defaults.baseURL;

  const debugInfo = {
    timestamp,
    context,
    baseUrl,
    token: {
      exists: !!localStorage.getItem("token"),
      length: (localStorage.getItem("token") || "").length,
    },
    data,
  };

  console.log(`🔍 [Ngrok Debug - ${context}]`, debugInfo);

  // Optional: Send ke backend untuk server-side logging
  // Tapi only jika ngrok connectivity good
  if (api.defaults.baseURL) {
    api.post("/debug-log", debugInfo).catch(() => {
      // Silent fail jika debug endpoint tidak ada
    });
  }
}

/**
 * Validation function untuk ngrok setup
 */
export function validateNgrokSetup() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check 1: API URL configured
  const apiUrl = api.defaults.baseURL;
  if (!apiUrl) {
    errors.push("❌ API_URL tidak dikonfigurasi di axios");
  } else if (!apiUrl.includes("ngrok")) {
    warnings.push("⚠️ API_URL tidak terlihat menggunakan ngrok tunnel");
  } else {
    console.log("✅ API_URL configured dengan ngrok:", apiUrl);
  }

  // Check 2: Token exists
  const token = localStorage.getItem("token");
  if (!token) {
    warnings.push("⚠️ Token tidak ditemukan - user mungkin belum login");
  } else {
    console.log("✅ Token tersedia di localStorage");
  }

  // Check 3: Required headers
  if (!api.defaults.headers["ngrok-skip-browser-warning"]) {
    warnings.push("⚠️ ngrok-skip-browser-warning header tidak set (opsional)");
  }

  return { errors, warnings, isValid: errors.length === 0 };
}
