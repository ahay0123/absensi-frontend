"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Clock,
  MapPin,
  BookOpen,
  Camera,
  CheckCircle2,
  Loader2,
  QrCode,
  AlertCircle,
  ScanLine,
} from "lucide-react";
import api from "@/lib/axios";
import Alert, { useAlert } from "@/components/Alert";

interface Schedule {
  id: number;
  room: {
    name: string;
    qr_payload?: string;
    latitude?: number;
    longitude?: number;
  };
  start_time: string;
  end_time: string;
  day: string;
}

export default function AbsensiPage() {
  const params = useParams();
  const router = useRouter();
  const scheduleId = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ code: string; message: string } | null>(
    null,
  );
  const [step, setStep] = useState(1); // 1: Info, 2: QR Scan, 3: Selfie, 4: Submit
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    lat: number;
    long: number;
    accuracy: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [attendanceType, setAttendanceType] = useState<
    "check_in" | "check_out"
  >("check_in");
  const [checkInStatus, setCheckInStatus] = useState<boolean>(false);
  const [canCheckOut, setCanCheckOut] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<string>("");
  const { alert, showAlert, hideAlert } = useAlert();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch schedule data function
  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = `/schedules/${scheduleId}`;
      console.log("📚 [Presensi] Fetching schedule data", {
        endpoint,
        scheduleId,
        timestamp: new Date().toISOString(),
      });

      const response = await api.get(endpoint);

      console.log("📡 [Presensi] API Response received:", {
        status: response.status,
        data: response.data,
        hasSchedule: !!response.data?.schedule,
      });

      // Handle both response structures for compatibility
      const scheduleData = response.data?.schedule || response.data?.data;

      if (!scheduleData) {
        console.warn(
          "⚠️ [Presensi] Response missing schedule data:",
          response.data,
        );
        throw new Error(
          "Data jadwal tidak valid - respons server tidak berisi jadwal yang diharapkan",
        );
      }

      // Validate schedule has required fields
      if (!scheduleData.room) {
        throw new Error("Data ruang kelas tidak tersedia");
      }

      setSchedule(scheduleData);
      console.log("✅ [Presensi] Schedule loaded successfully:", {
        id: scheduleData.id,
        room: scheduleData.room?.name,
        day: scheduleData.day,
      });
    } catch (err: any) {
      console.error("❌ [Presensi] Error loading schedule:", {
        error: err,
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: {
          url: err.config?.url,
          method: err.config?.method,
        },
      });

      let errorCode = "UNKNOWN_ERROR";
      let errorMessage = "Terjadi kesalahan saat memuat jadwal";
      let debugInfo = "";

      if (err.response?.status === 404) {
        errorCode = "SCHEDULE_NOT_FOUND";
        errorMessage =
          "Jadwal tidak ditemukan atau Anda tidak memiliki akses ke jadwal ini";
        debugInfo =
          "Endpoint returned 404 - schedule not found or no permission";
      } else if (err.response?.status === 401) {
        errorCode = "UNAUTHORIZED";
        errorMessage = "Anda tidak terautentikasi. Silakan login kembali";
        debugInfo = "Token tidak valid atau session expired";
      } else if (err.response?.status === 403) {
        errorCode = "FORBIDDEN";
        errorMessage = "Anda tidak memiliki akses ke jadwal ini";
        debugInfo = "Authorization failed - user doesn't own this schedule";
      } else if (err.response?.status === 500) {
        errorCode = "SERVER_ERROR";
        errorMessage = "Server mengalami error. Coba lagi dalam beberapa saat";
        debugInfo = err.response?.data?.message || "Internal server error";
      } else if (
        err.message === "Network Error" ||
        err.code === "ERR_NETWORK" ||
        err.code === "ECONNABORTED"
      ) {
        errorCode = "NETWORK_ERROR";
        errorMessage =
          "Gagal terhubung ke server. Periksa koneksi internet Anda";
        debugInfo = "Network connectivity issue";
      } else if (err.message?.includes("Data jadwal tidak valid")) {
        errorCode = "INVALID_RESPONSE";
        errorMessage = err.message;
        debugInfo = "API response structure tidak sesuai";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        debugInfo = err.response.data.message;
      }

      console.error("📋 [Presensi] Debug Info:", {
        errorCode,
        errorMessage,
        debugInfo,
        endpoint: `/schedules/${scheduleId}`,
      });

      setError({ code: errorCode, message: errorMessage });
      showAlert("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch schedule data on component mount
  useEffect(() => {
    if (scheduleId) {
      fetchScheduleData();
    }
  }, [scheduleId]);

  // Timer untuk countdown checkout - bisa check-out 15 menit sebelum kelas berakhir
  useEffect(() => {
    if (!schedule) return;

    const checkTimer = setInterval(() => {
      const now = new Date();
      const endTime = new Date();
      const [hours, minutes, seconds] = schedule.end_time
        .split(":")
        .map(Number);
      endTime.setHours(hours, minutes, seconds);

      // Checkout bisa dibuka 15 menit sebelum class end
      const checkoutOpenTime = new Date(endTime.getTime() - 15 * 60 * 1000);

      if (now >= checkoutOpenTime) {
        setCanCheckOut(true);
        setRemainingTime("0");
      } else {
        const diffMs = checkoutOpenTime.getTime() - now.getTime();
        const mins = Math.floor(diffMs / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);
        setRemainingTime(`${mins}m ${secs}s`);
        setCanCheckOut(false);
      }
    }, 1000);

    return () => clearInterval(checkTimer);
  }, [schedule]);

  // Get GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      console.log("📍 Getting GPS location...");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            long: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
          console.log("✅ Location obtained:", pos.coords);
        },
        (err) => {
          console.error("❌ GPS Error:", err.message);
          showAlert(
            "error",
            "Gagal mendapatkan lokasi GPS. Pastikan izin lokasi diaktifkan.",
          );
        },
        { enableHighAccuracy: true },
      );
    }
  }, []);

  // Initialize QR Scanner when step changes to 2
  useEffect(() => {
    if (step === 2) {
      const initQrScanner = async () => {
        try {
          // Dynamically import html5-qrcode
          const { Html5QrcodeScanner } = await import("html5-qrcode");

          const scanner = new Html5QrcodeScanner(
            "qr-reader",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            false,
          );

          scanner.render(
            (decodedText) => {
              console.log("✅ QR Code scanned:", decodedText);
              setQrData(decodedText);
              scanner.clear();
              setStep(3);
              startCamera();
            },
            (error) => {
              // Ignore frequent scanning errors
              // console.warn("QR scan error:", error);
            },
          );

          return () => {
            scanner.clear().catch(() => {});
          };
        } catch (err) {
          console.error("❌ QR Scanner Error:", err);
          showAlert(
            "warning",
            "Gagal memulai QR scanner. Gunakan tombol Lewati untuk testing.",
          );
        }
      };

      initQrScanner();
    }
  }, [step]);

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      console.log("📷 Camera started");
    } catch (err) {
      console.error("❌ Camera Error:", err);
      showAlert(
        "error",
        "Gagal mengakses kamera. Pastikan izin kamera diaktifkan.",
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      console.log("📷 Camera stopped");
    }
  };

  const takeSelfie = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.scale(-1, 1);
      context?.drawImage(videoRef.current, -canvasRef.current.width, 0);
      stopCamera();

      canvasRef.current.toBlob(
        (blob) => {
          if (blob) submitAttendance(blob);
        },
        "image/jpeg",
        0.8,
      );
    }
  };

  const submitAttendance = async (photoBlob: Blob) => {
    if (!location) {
      showAlert(
        "error",
        "Lokasi GPS belum tersedia. Tunggu sebentar dan coba lagi.",
      );
      setStep(3);
      startCamera();
      return;
    }

    setSubmitting(true);
    setStep(4);

    const formData = new FormData();
    formData.append("schedule_id", String(scheduleId));
    formData.append("attendance_type", attendanceType); // Add attendance type
    formData.append("qr_payload", qrData || "");
    formData.append("photo", photoBlob, "selfie.jpg");
    formData.append("lat_check", location.lat.toString());
    formData.append("long_check", location.long.toString());
    formData.append("gps_accuracy", location.accuracy.toString());

    try {
      const response = await api.post("/test-absen", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("✅ Attendance submitted:", response.data);
      showAlert("success", response.data.message);

      // Update state after successful check-in
      if (attendanceType === "check_in") {
        setCheckInStatus(true);
        setAttendanceType("check_out");
        setStep(1);
      } else {
        // After checkout, go back to home
        setTimeout(() => router.push("/"), 2500);
      }
    } catch (err: any) {
      console.error("❌ Submission error:", err.response?.data);
      showAlert(
        "error",
        err.response?.data?.message || "Gagal mengirim absensi. Coba lagi.",
      );
      setStep(1); // Reset to start
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // Error state UI
  if (error || !schedule) {
    return (
      <main className="min-h-screen bg-slate-50 p-4">
        {/* Alert Component */}
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={hideAlert}
          />
        )}

        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-lg border border-slate-100">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-800 text-center mb-2">
              Gagal Memuat Jadwal
            </h2>

            <p className="text-slate-600 text-center text-sm mb-6">
              {error?.message ||
                "Terjadi kesalahan saat memuat data jadwal. Silakan coba lagi."}
            </p>

            {/* Error code for debugging */}
            <div className="bg-slate-50 rounded-xl p-3 mb-6 text-xs text-slate-500 font-mono">
              Error Code:{" "}
              <span className="font-bold">{error?.code || "UNKNOWN"}</span>
              <br />
              Schedule ID: <span className="font-bold">{scheduleId}</span>
            </div>

            {/* Help Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
              <p className="font-bold mb-2">💡 Kemungkinan penyebab:</p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                {error?.code === "SCHEDULE_NOT_FOUND" && (
                  <>
                    <li>Jadwal tidak lagi tersedia atau sudah dihapus</li>
                    <li>Anda tidak memiliki akses ke jadwal ini</li>
                    <li>Jadwal milik guru/user lain</li>
                  </>
                )}
                {error?.code === "UNAUTHORIZED" && (
                  <>
                    <li>Session Anda telah berakhir</li>
                    <li>Perlu login kembali</li>
                  </>
                )}
                {error?.code === "NETWORK_ERROR" && (
                  <>
                    <li>Koneksi internet tidak stabil</li>
                    <li>Server tidak dapat dijangkau</li>
                    <li>Coba ubah koneksi WiFi atau data</li>
                  </>
                )}
                {!error?.code && (
                  <>
                    <li>Coba refresh halaman</li>
                    <li>Cek koneksi internet Anda</li>
                  </>
                )}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  // Trigger re-fetch by resetting
                  fetchScheduleData();
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors active:scale-95"
              >
                🔄 Coba Lagi
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-colors active:scale-95"
              >
                ← Kembali
              </button>
            </div>

            <p className="text-xs text-slate-400 text-center mt-4">
              Jika masalah berlanjut, hubungi admin sekolah
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Alert Component */}
      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={hideAlert} />
      )}

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
                {schedule?.start_time?.substring(0, 5)} -{" "}
                {schedule?.end_time?.substring(0, 5)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{schedule?.room?.name || "Ruang Kelas"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100">
          {/* Step 1: Ready */}
          {step === 1 && (
            <div className="py-10 flex flex-col items-center text-center">
              {!checkInStatus ? (
                <>
                  {/* CHECK-IN MODE */}
                  <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg mb-6">
                    <ScanLine className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">
                    Siap Mengajar?
                  </h2>
                  <p className="text-slate-400 text-sm mb-6">
                    Scan QR Code ruangan untuk memulai absensi
                  </p>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold active:scale-95 transition-all shadow-lg shadow-indigo-200"
                  >
                    Mulai Scan QR
                  </button>
                </>
              ) : (
                <>
                  {/* CHECK-OUT MODE */}
                  <div
                    className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg mb-6 ${
                      canCheckOut ? "bg-green-600" : "bg-amber-600"
                    }`}
                  >
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">
                    {canCheckOut
                      ? "✅ Jam Berakhir - Check-Out Sekarang"
                      : "⏳ Menunggu Jam Berakhir"}
                  </h2>
                  <p className="text-slate-500 text-sm mb-6">
                    {canCheckOut
                      ? "Anda sudah bisa melakukan check-out"
                      : `Waktu tersisa: ${remainingTime}`}
                  </p>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!canCheckOut}
                    className={`w-full py-4 rounded-2xl font-bold active:scale-95 transition-all shadow-lg ${
                      canCheckOut
                        ? "bg-green-600 text-white shadow-green-200"
                        : "bg-slate-300 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    {canCheckOut ? "Lakukan Check-Out" : "Tunggu Jam Berakhir"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Step 2: QR Scanner */}
          {step === 2 && (
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
                  setQrData("MANUAL-TEST-QR");
                  setStep(3);
                  startCamera();
                }}
                className="w-full text-xs text-slate-400 underline py-2"
              >
                Lewati Scan (Testing Only)
              </button>
            </div>
          )}

          {/* Step 3: Selfie */}
          {step === 3 && (
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
                onClick={takeSelfie}
                className="mx-auto block w-16 h-16 bg-white border-4 border-indigo-600 rounded-full shadow-lg active:scale-90 transition-all"
              />
            </div>
          )}

          {/* Step 4: Processing */}
          {step === 4 && (
            <div className="py-10 text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-indigo-600 mb-4" />
              <p className="font-bold text-slate-800">Memproses absensi...</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
