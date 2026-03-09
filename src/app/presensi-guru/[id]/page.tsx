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
  const [step, setStep] = useState(1); // 1: Info, 2: QR Scan, 3: Selfie, 4: Submit
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    lat: number;
    long: number;
    accuracy: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { alert, showAlert, hideAlert } = useAlert();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch schedule data
  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        console.log("📚 Fetching schedule data for ID:", scheduleId);
        const response = await api.get(`/schedules/${scheduleId}`);
        setSchedule(response.data.schedule);
        console.log("✅ Schedule loaded:", response.data);
      } catch (err) {
        console.error("❌ Error loading schedule:", err);
        showAlert("error", "Gagal memuat data jadwal");
        setTimeout(() => router.push("/"), 2000);
      } finally {
        setLoading(false);
      }
    };

    if (scheduleId) {
      fetchScheduleData();
    }
  }, [scheduleId, router]);

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
          showAlert("error", "Gagal mendapatkan lokasi GPS. Pastikan izin lokasi diaktifkan.");
        },
        { enableHighAccuracy: true }
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
            false
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
            }
          );

          return () => {
            scanner.clear().catch(() => { });
          };
        } catch (err) {
          console.error("❌ QR Scanner Error:", err);
          showAlert("warning", "Gagal memulai QR scanner. Gunakan tombol Lewati untuk testing.");
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
      showAlert("error", "Gagal mengakses kamera. Pastikan izin kamera diaktifkan.");
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
        0.8
      );
    }
  };

  const submitAttendance = async (photoBlob: Blob) => {
    if (!location) {
      showAlert("error", "Lokasi GPS belum tersedia. Tunggu sebentar dan coba lagi.");
      setStep(3);
      startCamera();
      return;
    }

    setSubmitting(true);
    setStep(4);

    const formData = new FormData();
    formData.append("schedule_id", String(scheduleId));
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
      setTimeout(() => router.push("/"), 2500);
    } catch (err: any) {
      console.error("❌ Submission error:", err.response?.data);
      showAlert(
        "error",
        err.response?.data?.message || "Gagal mengirim absensi. Coba lagi."
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

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Alert Component */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={hideAlert}
        />
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
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg mb-6">
                <ScanLine className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Siap Mengajar?</h2>
              <p className="text-slate-400 text-sm mb-6">
                Scan QR Code ruangan untuk memulai absensi
              </p>
              <button
                onClick={() => setStep(2)}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold active:scale-95 transition-all shadow-lg shadow-indigo-200"
              >
                Mulai Scan QR
              </button>
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
