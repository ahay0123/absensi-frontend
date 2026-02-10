"use client";
import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "@/lib/axios";
import {
  Camera,
  MapPin,
  ScanLine,
  UserCheck,
  Loader2,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function AbsensiPage() {
  const params = useParams();
  const router = useRouter();
  const scheduleId = params?.id;

  const [step, setStep] = useState(1); // 1: Standby, 2: Scan QR, 3: Selfie, 4: Loading/Result
  const [location, setLocation] = useState<{
    lat: number;
    long: number;
    accuracy: number;
  } | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- EFFECT: Ambil Lokasi GPS Akurat ---
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            long: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        (err) => console.error("GPS Error:", err),
        { enableHighAccuracy: true },
      );
    }
  }, []);

  // --- LOGIC: Navigasi Kembali ---
  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) {
      stopCamera();
      setStep(2);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  // --- LOGIC: Scan QR Code ---
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (step === 2) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: 250 },
        false,
      );
      scanner.render(
        (decodedText) => {
          setQrData(decodedText);
          scanner?.clear().then(() => {
            setStep(3);
            startCamera();
          });
        },
        (error) => {
          /* ignore scan errors */
        },
      );
    }

    return () => {
      if (scanner) scanner.clear().catch((e) => console.error(e));
    };
  }, [step]);

  // --- LOGIC: Kamera Selfie ---
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Gagal mengakses kamera depan.");
    }
  };

  const takeSelfie = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.scale(-1, 1); // Mirroring back
      context?.drawImage(videoRef.current, -canvasRef.current.width, 0);

      stopCamera();

      canvasRef.current.toBlob(
        (blob) => {
          if (blob) sendAttendance(blob);
        },
        "image/jpeg",
        0.8,
      );
    }
  };

  // --- LOGIC: Kirim ke API Laravel ---
  const sendAttendance = async (photoBlob: Blob) => {
    setIsLoading(true);
    setStep(4);

    const formData = new FormData();
    formData.append("schedule_id", scheduleId as string);
    formData.append("qr_payload", qrData || "");
    formData.append("photo", photoBlob, "selfie.jpg");
    formData.append("lat_check", location?.lat.toString() || "");
    formData.append("long_check", location?.long.toString() || "");
    formData.append("gps_accuracy", location?.accuracy.toString() || "10");

    try {
      const response = await api.post("/test-absen", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatusMessage({ type: "success", text: response.data.message });
      setTimeout(() => router.push("/"), 3000); // Redirect setelah 3 detik
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.response?.data?.message || "Gagal mengirim absensi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-6 text-slate-800">
      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-10 mt-4">
        <div className="flex items-center gap-4">
          {step < 4 && (
            <button
              onClick={step === 1 ? () => router.push("/") : handleBack}
              className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center active:scale-90 transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Presensi Kehadiran
            </h1>
            <p className="text-sm text-slate-400">ID Jadwal: #{scheduleId}</p>
          </div>
        </div>
        <div
          className={`p-2 rounded-full ${location ? "bg-green-50" : "bg-red-50"}`}
        >
          <MapPin
            className={`w-5 h-5 ${location ? "text-green-500" : "text-red-500"}`}
          />
        </div>
      </div>

      <div className="w-full max-w-md bg-slate-50 rounded-[2.5rem] p-4 border border-slate-100 shadow-2xl shadow-slate-200">
        {step === 1 && (
          <div className="py-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center rotate-3 shadow-xl shadow-blue-200 mb-8">
              <ScanLine className="w-12 h-12 text-white -rotate-3" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-800">
              Siap Mengajar?
            </h2>
            <p className="text-slate-500 mb-10 px-6">
              Dekatkan HP ke QR Code yang ada di dalam ruangan kelas.
            </p>
            <button
              onClick={() => setStep(2)}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg active:scale-95 transition-all"
            >
              Mulai Scan QR
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="p-2">
            <div
              id="reader"
              className="overflow-hidden rounded-3xl bg-black aspect-square"
            ></div>
            <p className="text-center mt-6 font-medium text-slate-600 italic">
              Arahkan kamera ke QR Code Ruangan
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center">
            <div className="relative w-full aspect-[3/4] bg-black rounded-3xl overflow-hidden shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <h3 className="mt-6 font-bold text-lg">Verifikasi Wajah</h3>
            <p className="text-slate-400 text-sm mb-8">
              Ambil selfie sebagai bukti kehadiran di kelas.
            </p>
            <button
              onClick={takeSelfie}
              className="w-20 h-20 bg-white border-8 border-blue-600 rounded-full active:scale-90 transition-all shadow-lg"
            ></button>
          </div>
        )}

        {step === 4 && (
          <div className="py-20 flex flex-col items-center text-center">
            {isLoading ? (
              <>
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="font-bold text-lg">Validasi Data...</p>
                <p className="text-slate-400 text-sm">
                  Mengecek Lokasi & QR Code
                </p>
              </>
            ) : statusMessage?.type === "success" ? (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Berhasil!
                </h2>
                <p className="text-slate-500 px-6">{statusMessage.text}</p>
                <p className="mt-8 text-xs text-slate-400 italic">
                  Mengalihkan ke dashboard...
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Absensi Gagal
                </h2>
                <p className="text-slate-500 px-6 mb-8">
                  {statusMessage?.text}
                </p>
                <button
                  onClick={() => setStep(1)}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold"
                >
                  Coba Lagi
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
