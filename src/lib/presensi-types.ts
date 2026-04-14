/**
 * Presensi System Type Definitions
 * Centralized types untuk entire presensi flow
 */

// ============ API Response Types ============
export interface Room {
  id: number;
  name: string;
  qr_payload?: string;
  latitude?: number;
  longitude?: number;
}

export interface Schedule {
  id: number;
  user_id?: number;
  room: Room;
  start_time: string;
  end_time: string;
  day: string;
  subject?: string;
  [key: string]: any; // Allow additional fields
}

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

// ============ State Management Types ============
export interface LocationData {
  lat: number;
  long: number;
  accuracy: number;
  timestamp: number;
}

export interface ErrorState {
  code: ErrorCode;
  message: string;
  details?: string;
  timestamp: number;
  retryable: boolean;
}

export interface PresentiState {
  // Navigation
  step: Step;

  // Data
  schedule: Schedule | null;
  location: LocationData | null;
  qrData: string | null;
  selfieBlob: Blob | null;

  // Status
  loading: boolean;
  submitting: boolean;
  canCheckOut: boolean;
  checkInStatus: boolean;
  checksOutTime: string;

  // Submissions
  checkInTime?: string;
  checkOutTime?: string;

  // Error
  error: ErrorState | null;
}

export interface PresensiAction {
  type: PresensiActionType;
  payload?: any;
}

// ============ Enums ============
export type Step =
  | "info"
  | "qr_scan"
  | "selfie"
  | "processing"
  | "success"
  | "error";

export type AttendanceType = "check_in" | "check_out";

export enum ErrorCode {
  SCHEDULE_NOT_FOUND = "SCHEDULE_NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NETWORK_ERROR = "NETWORK_ERROR",
  NETWORK_TIMEOUT = "NETWORK_TIMEOUT",
  SERVER_ERROR = "SERVER_ERROR",
  INVALID_RESPONSE = "INVALID_RESPONSE",
  GPS_ERROR = "GPS_ERROR",
  CAMERA_ERROR = "CAMERA_ERROR",
  QR_SCANNER_ERROR = "QR_SCANNER_ERROR",
  SUBMISSION_ERROR = "SUBMISSION_ERROR",
  UNKNOWN = "UNKNOWN",
}

export type PresensiActionType =
  | "INIT"
  | "SET_STEP"
  | "SET_SCHEDULE"
  | "SET_LOCATION"
  | "SET_QR_DATA"
  | "SET_SELFIE"
  | "SET_CHECK_IN_STATUS"
  | "SET_CHECK_OUT_TIME"
  | "SET_LOADING"
  | "SET_SUBMITTING"
  | "SET_ERROR"
  | "CLEAR_ERROR"
  | "RESET";

// ============ Config Types ============
export interface PresentiConfig {
  checkoutLeadTimeMinutes: number;
  gpsTimeout: number;
  gpsMaxRetries: number;
  apiRetryAttempts: number;
  apiRetryDelayMs: number;
  maxPhotoSize: number; // bytes
}

// ============ Utility Types ============
export interface FetchScheduleOptions {
  forceRefresh?: boolean;
  skipValidation?: boolean;
}

export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
}

// ============ API Request Types ============
export interface SubmitAttendancePayload {
  schedule_id: string | number;
  attendance_type: AttendanceType;
  qr_payload?: string;
  photo: Blob;
  lat_check: number;
  long_check: number;
  gps_accuracy: number;
  timestamp?: number;
}
