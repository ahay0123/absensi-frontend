"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  ArrowLeft,
  Clock,
  MapPin,
  BookOpen,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ScanLine,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";

import Alert, { useAlert } from "@/components/Alert";
import { usePresentiState } from "@/lib/use-presensi-state";
import {
  useCamera,
  useQRScanner,
  usePhotoCaptureCanvas,
} from "@/lib/use-camera-qr";
import { useNgrokMonitoring, useNgrokErrorRecovery } from "@/lib/use-ngrok";
import {
  fetchScheduleWithValidation,
  submitAttendance,
  requestGPSLocation,
  createErrorState,
} from "@/lib/presensi-api";
import type { AttendanceType, LocationData } from "@/lib/presensi-types";

/**
 * REFACTORED: Presensi Guru Page
 *
 * Improvements:
 * 1. Better state management dengan reducer pattern (usePresentiState)
 * 2. Comprehensive error handling dengan retry logic
 * 3. Proper resource cleanup dengan custom hooks
 * 4. Ngrok-specific monitoring & debugging
 * 5. Better separation of concerns
 * 6. More maintainable & easier to extend
 *
 * Architecture:
 * - State: usePresentiState hook (single source of truth)
 * - API: presensi-api utils dengan retry & validation
 * - Media: useCamera, useQRScanner, usePhotoCaptureCanvas hooks
 * - Network: useNgrokMonitoring untuk backend health checks
 */

export default function AbsensiPage() {
  const params = useParams();
  const router = useRouter();

  // Handle scheduleId - can be string or string[] from dynamic route
  const scheduleId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  // State management
  const prsensi = usePresentiState();
  const { alert, showAlert, hideAlert } = useAlert();

  // Media hooks
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { startCamera, stopCamera } = useCamera(videoRef);
  const { initQRScanner, stopQRScanner } = useQRScanner(
    "qr-reader",
    handleQRScanned,
  );
  const { capturePhoto } = usePhotoCaptureCanvas(canvasRef, videoRef);

  // Network monitoring
  const ngrok = useNgrokMonitoring();
  const { getRecoverySteps } = useNgrokErrorRecovery();

  // ============ Event Handlers ============

  async function handleQRScanned(decodedText: string) {
    console.log("✅ [QR] Scanned successfully");
    prsensi.setQRData(decodedText);
    await stopQRScanner();
    prsensi.setStep("selfie");
    startCamera();
  }

  async function handleTakeSelfie() {
    try {
      prsensi.setSubmitting(true);
      const blob = await capturePhoto();
      if (blob) {
        prsensi.setSelfie(blob);
        prsensi.setStep("processing");
        await submitPresence(blob);
      }
    } catch (err: any) {
      showAlert("error", err.message);
      prsensi.setSubmitting(false);
      await startCamera();
    }
  }

  async function submitPresence(photoBlob: Blob) {
    try {
      if (!prsensi.state.location) {
        showAlert("error", "Lokasi GPS belum tersedia");
        prsensi.setStep("selfie");
        await startCamera();
        return;
      }

      const response = await submitAttendance({
        schedule_id: scheduleId as string,
        attendance_type: (prsensi.state.checkInStatus
          ? "check_out"
          : "check_in") as AttendanceType,
        qr_payload: prsensi.state.qrData || "",
        photo: photoBlob,
        lat_check: prsensi.state.location.lat,
        long_check: prsensi.state.location.long,
        gps_accuracy: prsensi.state.location.accuracy,
      });

      showAlert("success", response.message || "Presensi berhasil!");

      // Handle post-submission
      if (!prsensi.state.checkInStatus) {
        // Check-in successful
        prsensi.setCheckInStatus(true);
        prsensi.setStep("info");
      } else {
        // Check-out successful
        setTimeout(() => router.push("/"), 2500);
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "Gagal mengirim presensi";
      showAlert("error", msg);
      prsensi.setStep("info");
    } finally {
      prsensi.setSubmitting(false);
    }
  }

  // ============ Effects ============

  // Fetch schedule on mount
  useEffect(() => {
    if (!scheduleId) return;

    const fetchSchedule = async () => {
      try {
        prsensi.setLoading(true);
        const schedule = await fetchScheduleWithValidation(
          scheduleId as string,
        );
        prsensi.setSchedule(schedule);
      } catch (err: any) {
        const errorState = createErrorState(err, "Schedule Fetch");
        prsensi.setError(errorState);
        showAlert("error", errorState.message);
      } finally {
        prsensi.setLoading(false);
      }
    };

    fetchSchedule();
  }, [scheduleId]);

  // Request GPS location on mount
  useEffect(() => {
    const getLocation = async () => {
      try {
        console.log("📍 Requesting GPS location...");
        const location = await requestGPSLocation(prsensi.config.gpsTimeout);
        prsensi.setLocation({
          ...location,
          timestamp: Date.now(),
        });
      } catch (err: any) {
        console.error("❌ GPS Error:", err);
        showAlert(
          "warning",
          "Gagal mendapatkan lokasi GPS. Pastikan izin lokasi diaktifkan.",
        );
      }
    };

    getLocation();
  }, []);

  // Checkout timer
  useEffect(() => {
    if (!prsensi.state.schedule) return;

    const schedule = prsensi.state.schedule;
    const interval = setInterval(() => {
      const now = new Date();
      const endTime = new Date();
      const [hours, minutes, seconds] = schedule.end_time
        .split(":")
        .map(Number);
      endTime.setHours(hours, minutes, seconds);

      const checkoutOpenTime = new Date(
        endTime.getTime() - prsensi.config.checkoutLeadTimeMinutes * 60 * 1000,
      );

      if (now >= checkoutOpenTime) {
        prsensi.setCheckOutTime(
          prsensi.config.checkoutLeadTimeMinutes.toString(),
        );
      } else {
        const diffMs = checkoutOpenTime.getTime() - now.getTime();
        const mins = Math.floor(diffMs / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);
        prsensi.setCheckOutTime(`${mins}m ${secs}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [prsensi.state.schedule]);

  // Initialize QR Scanner when step changes
  useEffect(() => {
    if (prsensi.state.step === "qr_scan") {
      initQRScanner().catch((err) => {
        console.error("Failed to init QR scanner:", err);
        showAlert(
          "warning",
          "Gagal memulai QR scanner. Gunakan tombol Lewati untuk testing.",
        );
      });
    } else {
      stopQRScanner();
    }

    return () => {
      stopQRScanner();
    };
  }, [prsensi.state.step, initQRScanner, stopQRScanner]);

  // ============ Render Helpers ============

  function renderErrorUI() {
    const error = prsensi.state.error;
    if (!error) return null;

    const recovery = getRecoverySteps(error);

    return (
      <main className="min-h-screen bg-slate-50 p-4">
        {alert && <Alert {...alert} onClose={hideAlert} />}

        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-lg border border-slate-100">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-800 text-center mb-2">
              Gagal Memuat Data
            </h2>

            <p className="text-slate-600 text-center text-sm mb-6">
              {error.message}
            </p>

            {error.details && (
              <div className="bg-slate-50 rounded-xl p-3 mb-6 text-xs text-slate-500 font-mono">
                {error.code}
                <br />
                {error.details}
              </div>
            )}

            {/* Ngrok Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 text-xs flex items-center gap-2">
              {ngrok.isHealthy ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
              <span>
                {ngrok.isHealthy ? "Backend aktif" : "Backend offline"}
              </span>
            </div>

            {/* Recovery Steps */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-900">
              <p className="font-bold mb-2">{recovery.title}</p>
              <ul className="text-xs space-y-1">
                {recovery.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                Coba Lagi
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-colors active:scale-95"
              >
                Kembali
              </button>
            </div>

            <p className="text-xs text-slate-400 text-center mt-4">
              Error Code: {error.code}
            </p>
          </div>
        </div>
      </main>
    );
  }

  function renderLoadingUI() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Memuat data jadwal...</p>
        </div>
      </div>
    );
  }

  // ============ Main Render ============

  if (prsensi.state.loading) {
    return renderLoadingUI();
  }

  if (prsensi.state.error || !prsensi.state.schedule) {
    return renderErrorUI();
  }

  const schedule = prsensi.state.schedule;
  const attendanceType: AttendanceType = prsensi.state.checkInStatus
    ? "check_out"
    : "check_in";

  return (
    <main className="min-h-screen bg-slate-50">
      {alert && <Alert {...alert} onClose={hideAlert} />}

      {/* Ngrok Status Badge */}
      <div className="fixed top-4 right-4 z-50">
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold ${
            ngrok.isHealthy
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {ngrok.isHealthy ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          {ngrok.isHealthy ? "Connected" : "Offline"}
        </div>
      </div>

      {/* Header */}
      <div className="bg-indigo-600 text-white p-6 rounded-b-[2.5rem] shadow-xl">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 mb-4 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium text-sm">Kembali</span>
        </button>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <h1 className="text-xl font-bold">Presensi Mengajar</h1>
          </div>
          <div className="flex items-center gap-4 text-indigo-100 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                {schedule.start_time.substring(0, 5)} -{" "}
                {schedule.end_time.substring(0, 5)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{schedule.room.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100">
          {/* Step: Info / Ready */}
          {prsensi.state.step === "info" && (
            <div className="py-10 flex flex-col items-center text-center">
              {prsensi.isCheckInMode ? (
                <>
                  <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg mb-6">
                    <ScanLine className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">
                    Siap Mengajar?
                  </h2>
                  <p className="text-slate-400 text-sm mb-6">
                    Scan QR Code dan ambil foto untuk mulai
                  </p>
                  <button
                    onClick={() => prsensi.setStep("qr_scan")}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold active:scale-95 transition-all shadow-lg shadow-indigo-200"
                  >
                    Mulai Presensi
                  </button>
                </>
              ) : (
                <>
                  <div
                    className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg mb-6 ${
                      prsensi.state.canCheckOut
                        ? "bg-green-600"
                        : "bg-amber-600"
                    }`}
                  >
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">
                    {prsensi.state.canCheckOut
                      ? "✅ Jam Berakhir"
                      : "⏳ Menunggu Jam Berakhir"}
                  </h2>
                  <p className="text-slate-500 text-sm mb-6">
                    {prsensi.state.canCheckOut
                      ? "Anda sudah bisa melakukan check-out"
                      : `Waktu tersisa: ${prsensi.state.checksOutTime}`}
                  </p>
                  <button
                    onClick={() => prsensi.setStep("qr_scan")}
                    disabled={!prsensi.state.canCheckOut}
                    className={`w-full py-4 rounded-2xl font-bold active:scale-95 transition-all shadow-lg ${
                      prsensi.state.canCheckOut
                        ? "bg-green-600 text-white shadow-green-200"
                        : "bg-slate-300 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    Checkout
                  </button>
                </>
              )}
            </div>
          )}

          {/* Step: QR Scanner */}
          {prsensi.state.step === "qr_scan" && (
            <div className="space-y-4">
              <div
                id="qr-reader"
                className="aspect-square bg-slate-800 rounded-3xl overflow-hidden"
              />
              <p className="text-center text-sm text-slate-500 italic">
                Arahkan kamera ke QR Code ruangan
              </p>
              <button
                onClick={() => {
                  prsensi.setQRData("MANUAL-TEST");
                  prsensi.setStep("selfie");
                  startCamera();
                }}
                className="w-full text-xs text-slate-400 underline py-2"
              >
                Lewati Scan (Testing)
              </button>
            </div>
          )}

          {/* Step: Selfie */}
          {prsensi.state.step === "selfie" && (
            <div className="space-y-4">
              <div className="relative aspect-[3/4] bg-black rounded-3xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <p className="text-center text-sm text-slate-600 font-medium">
                Pastikan wajah terlihat jelas
              </p>
              <button
                onClick={handleTakeSelfie}
                disabled={prsensi.state.submitting}
                className="mx-auto block w-16 h-16 bg-white border-4 border-indigo-600 rounded-full shadow-lg active:scale-90 transition-all disabled:opacity-50"
              />
            </div>
          )}

          {/* Step: Processing */}
          {prsensi.state.step === "processing" && (
            <div className="py-10 text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-indigo-600 mb-4" />
              <p className="font-bold text-slate-800">
                Memproses{" "}
                {prsensi.state.checkInStatus ? "check-out" : "check-in"}...
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
