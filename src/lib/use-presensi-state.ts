/**
 * Presensi State Hook dengan Reducer Pattern
 * Menggabung semua state menjadi single state object dengan clear actions
 * Lebih maintainable daripada 10+ useState
 */

import { useReducer, useCallback, useEffect, useRef } from "react";
import {
  PresentiState,
  PresensiAction,
  PresensiActionType,
  Step,
  AttendanceType,
  ErrorCode,
  LocationData,
  Schedule,
  PresentiConfig,
} from "./presensi-types";

// Default config
const DEFAULT_PRESENSI_CONFIG: PresentiConfig = {
  checkoutLeadTimeMinutes: 15,
  gpsTimeout: 10000,
  gpsMaxRetries: 3,
  apiRetryAttempts: 3,
  apiRetryDelayMs: 1000,
  maxPhotoSize: 5 * 1024 * 1024, // 5MB
};

// Initial state
const createInitialState = (): PresentiState => ({
  step: "info",
  schedule: null,
  location: null,
  qrData: null,
  selfieBlob: null,
  loading: true,
  submitting: false,
  canCheckOut: false,
  checkInStatus: false,
  checksOutTime: "",
  error: null,
});

/**
 * State reducer dengan single source of truth
 * Clear action types dan payload typing
 */
function presentiReducer(
  state: PresentiState,
  action: PresensiAction,
): PresentiState {
  switch (action.type) {
    case "INIT":
      return createInitialState();

    case "SET_STEP":
      return {
        ...state,
        step: action.payload as Step,
        error: null, // Clear error ketika navigate ke step baru
      };

    case "SET_SCHEDULE": {
      const schedule = action.payload as Schedule;
      return {
        ...state,
        schedule,
        loading: false,
        error: null,
      };
    }

    case "SET_LOCATION": {
      const location = action.payload as LocationData;
      return {
        ...state,
        location,
      };
    }

    case "SET_QR_DATA":
      return {
        ...state,
        qrData: action.payload as string,
      };

    case "SET_SELFIE":
      return {
        ...state,
        selfieBlob: action.payload as Blob,
      };

    case "SET_CHECK_IN_STATUS": {
      const status = action.payload as boolean;
      return {
        ...state,
        checkInStatus: status,
        // Kalau check-in sukses, ubah ke check-out mode
        step: status ? "info" : state.step,
      };
    }

    case "SET_CHECK_OUT_TIME":
      return {
        ...state,
        checksOutTime: action.payload as string,
        canCheckOut: true,
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload as boolean,
      };

    case "SET_SUBMITTING":
      return {
        ...state,
        submitting: action.payload as boolean,
      };

    case "SET_ERROR": {
      const error = action.payload;
      return {
        ...state,
        error,
        loading: false,
        submitting: false,
        step: "error",
      };
    }

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    case "RESET":
      return createInitialState();

    default:
      return state;
  }
}

/**
 * Custom hook untuk presensi state management
 * Returns state + dispatch + convenience methods
 */
export function usePresentiState(config: Partial<PresentiConfig> = {}) {
  const finalConfig = { ...DEFAULT_PRESENSI_CONFIG, ...config };
  const [state, dispatch] = useReducer(presentiReducer, createInitialState());
  const locationRetryCountRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ============ Dispatch wrappers untuk convenience ============

  const setStep = useCallback((step: Step) => {
    dispatch({ type: "SET_STEP", payload: step });
  }, []);

  const setSchedule = useCallback((schedule: Schedule) => {
    dispatch({ type: "SET_SCHEDULE", payload: schedule });
  }, []);

  const setLocation = useCallback((location: LocationData) => {
    dispatch({ type: "SET_LOCATION", payload: location });
  }, []);

  const setQRData = useCallback((qrData: string) => {
    dispatch({ type: "SET_QR_DATA", payload: qrData });
  }, []);

  const setSelfie = useCallback((blob: Blob) => {
    dispatch({ type: "SET_SELFIE", payload: blob });
  }, []);

  const setCheckInStatus = useCallback((status: boolean) => {
    dispatch({ type: "SET_CHECK_IN_STATUS", payload: status });
  }, []);

  const setCheckOutTime = useCallback((time: string) => {
    dispatch({ type: "SET_CHECK_OUT_TIME", payload: time });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  }, []);

  const setSubmitting = useCallback((submitting: boolean) => {
    dispatch({ type: "SET_SUBMITTING", payload: submitting });
  }, []);

  const setError = useCallback((error: any) => {
    dispatch({ type: "SET_ERROR", payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    dispatch({ type: "RESET" });
  }, []);

  // ============ Computed properties ============

  const isCheckInMode = !state.checkInStatus;
  const isCheckOutMode = state.checkInStatus;
  const hasLocation = state.location !== null;
  const hasQRData = state.qrData !== null;
  const hasSelfie = state.selfieBlob !== null;
  const isReady = hasLocation && hasQRData && hasSelfie;
  const hasError = state.error !== null;

  // ============ Cleanup ============

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    // State
    state,

    // Dispatch actions
    setStep,
    setSchedule,
    setLocation,
    setQRData,
    setSelfie,
    setCheckInStatus,
    setCheckOutTime,
    setLoading,
    setSubmitting,
    setError,
    clearError,
    reset,

    // Computed
    isCheckInMode,
    isCheckOutMode,
    hasLocation,
    hasQRData,
    hasSelfie,
    isReady,
    hasError,

    // Config
    config: finalConfig,
    timerRef,
    locationRetryCountRef,
  };
}

/**
 * Type export untuk usage di component
 */
export type UsePresentiState = ReturnType<typeof usePresentiState>;
