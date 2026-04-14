/**
 * Presensi API Utilities
 * Handles all API communication dengan robust error handling & retry logic
 */

import api from "./axios";
import {
  Schedule,
  ApiResponse,
  ErrorCode,
  ErrorState,
  SubmitAttendancePayload,
  RetryConfig,
  FetchScheduleOptions,
} from "./presensi-types";

// ============ Error Detection Utilities ============

/**
 * Detect error code dari berbagai jenis error
 * Lebih comprehensive daripada hanya check err.response.status
 */
export function detectErrorCode(error: any): ErrorCode {
  // Handle axios error
  if (error.response) {
    const status = error.response.status;

    if (status === 404) {
      return ErrorCode.SCHEDULE_NOT_FOUND;
    }
    if (status === 401) {
      return ErrorCode.UNAUTHORIZED;
    }
    if (status === 403) {
      return ErrorCode.FORBIDDEN;
    }
    if (status >= 500) {
      return ErrorCode.SERVER_ERROR;
    }

    // Check response data untuk custom error message
    const errorData = error.response.data;
    if (errorData?.code) {
      return errorData.code as ErrorCode;
    }
  }

  // Handle network/timeout errors
  if (error.code === "ECONNABORTED") {
    return ErrorCode.NETWORK_TIMEOUT;
  }
  if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
    return ErrorCode.NETWORK_ERROR;
  }

  // Handle request error (no response)
  if (error.request && !error.response) {
    return ErrorCode.NETWORK_ERROR;
  }

  // Check error message untuk custom errors
  if (error.message?.includes("Data jadwal tidak valid")) {
    return ErrorCode.INVALID_RESPONSE;
  }

  return ErrorCode.UNKNOWN;
}

/**
 * Create ErrorState dari error object
 * Determine apakah error bisa di-retry
 */
export function createErrorState(
  error: any,
  context: string = "Unknown",
): ErrorState {
  const code = detectErrorCode(error);
  const timestamp = Date.now();

  // Determine error message
  let message = "Terjadi kesalahan. Silakan coba lagi.";
  let details = "";

  if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.message) {
    message = error.message;
  }

  // Map error code ke user-friendly message
  switch (code) {
    case ErrorCode.SCHEDULE_NOT_FOUND:
      message =
        "Jadwal tidak ditemukan atau Anda tidak memiliki akses ke jadwal ini";
      details =
        "Jadwal mungkin sudah dihapus atau Anda tidak memiliki izin akses";
      break;
    case ErrorCode.UNAUTHORIZED:
      message = "Sesi login Anda telah berakhir. Silakan login kembali.";
      details = "Token tidak valid atau session expired";
      break;
    case ErrorCode.FORBIDDEN:
      message = "Anda tidak memiliki akses ke jadwal ini";
      details = "Jadwal ini milik guru/user lain";
      break;
    case ErrorCode.NETWORK_TIMEOUT:
      message =
        "Koneksi timeout. Server tidak merespons dalam waktu yang ditentukan.";
      details = "Coba lagi dengan koneksi yang lebih stabil";
      break;
    case ErrorCode.NETWORK_ERROR:
      message = "Gagal terhubung ke server. Periksa koneksi internet Anda.";
      details = "Ngrok tunnel mungkin tidak aktif atau koneksi terputus";
      break;
    case ErrorCode.SERVER_ERROR:
      message = "Server mengalami error. Coba lagi dalam beberapa saat.";
      details = error.response?.data?.message || "Internal server error";
      break;
    case ErrorCode.INVALID_RESPONSE:
      message = "Respon server tidak valid. Silakan hubungi admin.";
      details = "API response structure tidak sesuai dengan yang diharapkan";
      break;
  }

  // Determine jika error bisa di-retry
  const retryable = [
    ErrorCode.NETWORK_ERROR,
    ErrorCode.NETWORK_TIMEOUT,
    ErrorCode.SERVER_ERROR,
  ].includes(code);

  return {
    code,
    message,
    details,
    timestamp,
    retryable,
  };
}

// ============ Retry Logic with Exponential Backoff ============

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 5000,
};

/**
 * Retry function dengan exponential backoff
 * Useful untuk flaky network/API calls
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  context: string = "API Call",
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      console.log(
        `🔄 [${context}] Attempt ${attempt}/${finalConfig.maxAttempts}`,
      );
      const result = await fn();
      console.log(`✅ [${context}] Success on attempt ${attempt}`);
      return result;
    } catch (error) {
      lastError = error;
      const errorCode = detectErrorCode(error);

      // Hanya retry kalau error adalah retryable
      if (
        ![
          ErrorCode.NETWORK_ERROR,
          ErrorCode.NETWORK_TIMEOUT,
          ErrorCode.SERVER_ERROR,
        ].includes(errorCode)
      ) {
        console.log(`❌ [${context}] Non-retryable error: ${errorCode}`);
        throw error;
      }

      // Kalau sudah maksimal attempts, throw
      if (attempt === finalConfig.maxAttempts) {
        console.log(`❌ [${context}] Max retries reached`);
        throw error;
      }

      // Calculate delay dengan exponential backoff
      const delay = Math.min(
        finalConfig.delayMs *
          Math.pow(finalConfig.backoffMultiplier, attempt - 1),
        finalConfig.maxDelayMs,
      );

      console.warn(
        `⚠️ [${context}] Retry after ${delay}ms. Error: ${errorCode}`,
      );

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Semua retry habis, throw error terakhir
  throw lastError;
}

// ============ Schedule Fetching ============

/**
 * Pre-flight validation sebelum fetch schedule
 * Check token existence dan format
 */
export function validatePreFlight(): { valid: boolean; error?: ErrorState } {
  const token = localStorage.getItem("token");

  if (!token) {
    return {
      valid: false,
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: "Belum login. Silakan login terlebih dahulu.",
        details: "Token tidak ditemukan di localStorage",
        timestamp: Date.now(),
        retryable: false,
      },
    };
  }

  // Validate token format (Bearer token format)
  if (!token.startsWith("Bearer ") && !token.match(/^[A-Za-z0-9_-]+$/)) {
    return {
      valid: false,
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: "Token tidak valid. Silakan login kembali.",
        details: "Token format tidak sesuai",
        timestamp: Date.now(),
        retryable: false,
      },
    };
  }

  return { valid: true };
}

/**
 * Fetch schedule data dengan comprehensive validation
 * Menggabung multiple validation layers:
 * 1. Pre-flight (token check)
 * 2. API call dengan retry logic
 * 3. Response validation
 * 4. Data integrity check
 */
export async function fetchScheduleWithValidation(
  scheduleId: string | number,
  options: FetchScheduleOptions = {},
): Promise<Schedule> {
  const context = `Fetch Schedule ${scheduleId}`;

  // Step 1: Pre-flight validation
  const preflight = validatePreFlight();
  if (!preflight.valid) {
    throw new Error(preflight.error?.message);
  }

  console.log(`📚 [${context}] Starting fetch with validation`, {
    scheduleId,
    timestamp: new Date().toISOString(),
  });

  // Step 2: Fetch dengan retry logic
  const response = await retryWithBackoff(
    () => api.get(`/schedules/${scheduleId}`),
    { maxAttempts: 3 },
    context,
  );

  console.log(`📡 [${context}] API Response:`, {
    status: response.status,
    hasData: !!response.data,
    keys: Object.keys(response.data || {}),
  });

  // Step 3: Response validation - handle multiple response formats
  let scheduleData: Schedule | null = null;

  // Format 1: Direct schedule object
  if (response.data?.id && response.data?.room) {
    scheduleData = response.data;
  }
  // Format 2: Nested under 'schedule' key
  else if (response.data?.schedule?.id && response.data.schedule.room) {
    scheduleData = response.data.schedule;
  }
  // Format 3: Nested under 'data' key
  else if (response.data?.data?.id && response.data.data.room) {
    scheduleData = response.data.data;
  }

  // Step 4: Data integrity check
  if (!scheduleData) {
    throw new Error(
      "Data jadwal tidak valid - respons server tidak berisi jadwal yang diharapkan",
    );
  }

  if (!scheduleData.room) {
    throw new Error("Data ruang kelas tidak tersedia dalam jadwal");
  }

  if (!scheduleData.start_time || !scheduleData.end_time) {
    throw new Error("Data waktu pengajaran tidak lengkap");
  }

  console.log(`✅ [${context}] Schedule validated successfully:`, {
    id: scheduleData.id,
    room: scheduleData.room.name,
    day: scheduleData.day,
    time: `${scheduleData.start_time} - ${scheduleData.end_time}`,
  });

  return scheduleData;
}

// ============ Attendance Submission ============

/**
 * Submit attendance dengan comprehensive error handling
 */
export async function submitAttendance(
  payload: SubmitAttendancePayload,
  onProgress?: (status: string) => void,
): Promise<any> {
  const context = `Submit Attendance ${payload.schedule_id}`;

  console.log(`📤 [${context}] Preparing submission:`, {
    scheduleId: payload.schedule_id,
    type: payload.attendance_type,
    hasPhoto: !!payload.photo,
    location: {
      lat: payload.lat_check,
      long: payload.long_check,
      accuracy: payload.gps_accuracy,
    },
  });

  // Validate payload
  if (!payload.photo) {
    throw new Error("Foto tidak tersedia");
  }

  if (payload.photo.size > 5 * 1024 * 1024) {
    throw new Error("Ukuran foto terlalu besar (max 5MB)");
  }

  if (!payload.lat_check || !payload.long_check) {
    throw new Error("Lokasi GPS tidak tersedia");
  }

  // Prepare FormData
  const formData = new FormData();
  formData.append("schedule_id", String(payload.schedule_id));
  formData.append("attendance_type", payload.attendance_type);
  formData.append("qr_payload", payload.qr_payload || "");
  formData.append("photo", payload.photo, "selfie.jpg");
  formData.append("lat_check", payload.lat_check.toString());
  formData.append("long_check", payload.long_check.toString());
  formData.append("gps_accuracy", payload.gps_accuracy.toString());
  formData.append("timestamp", (payload.timestamp || Date.now()).toString());

  // Submit dengan retry logic
  try {
    onProgress?.("Mengirim data...");

    const response = await retryWithBackoff(
      () =>
        api.post("/test-absen", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 60000, // Longer timeout for file upload
        }),
      { maxAttempts: 2 },
      context,
    );

    console.log(`✅ [${context}] Submission successful:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ [${context}] Submission failed:`, error);
    throw error;
  }
}

// ============ Location Utilities ============

/**
 * Get GPS location dengan error handling
 */
export function requestGPSLocation(
  timeout: number = 10000,
): Promise<{ lat: number; long: number; accuracy: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation tidak didukung di browser ini"));
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error("GPS location request timeout"));
    }, timeout);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeoutId);
        console.log("✅ GPS Location obtained:", {
          lat: pos.coords.latitude,
          long: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        resolve({
          lat: pos.coords.latitude,
          long: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        clearTimeout(timeoutId);
        console.error("❌ GPS Error:", err);

        const error = new Error(
          err.code === 1
            ? "Izin lokasi ditolak"
            : err.code === 2
              ? "Lokasi tidak tersedia"
              : err.code === 3
                ? "Request timeout"
                : "Gagal mendapatkan lokasi",
        );

        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: timeout,
      },
    );
  });
}
