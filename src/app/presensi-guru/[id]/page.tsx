"use client";
import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "@/lib/axios";
import {
  Camera,
  MapPin,
  ScanLine,
  Loader2,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function AbsensiPage() {
  const params = useParams();
  const router = useRouter();

  // DEBUG 1: Cek Parameter URL
  const scheduleId = params?.id;
  console.log("DEBUG [1]: ID Jadwal diterima dari URL:", scheduleId);

  const [step, setStep] = useState(1);
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

  // DEBUG 2: Cek Mount Status
  useEffect(() => {
    console.log(
      "DEBUG [2]: Komponen AbsensiPage Berhasil Mount (Muncul di Layar)",
    );

    if (!scheduleId || scheduleId === "undefined") {
      console.error("DEBUG [X]: ERROR! ID Jadwal tidak valid atau undefined.");
      alert("Error: ID Jadwal tidak ditemukan di URL. Memindahkan kembali...");
      // router.push("/"); // Sementara di-comment agar tidak mental otomatis saat debug
    }
  }, [scheduleId]);

  // --- EFFECT: Ambil Lokasi GPS ---
  useEffect(() => {
    if (navigator.geolocation) {
      console.log("DEBUG [3]: Mencoba mengambil lokasi GPS...");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log(
            "DEBUG [4]: Lokasi Berhasil Didapat:",
            pos.coords.latitude,
            pos.coords.longitude,
          );
          setLocation({
            lat: pos.coords.latitude,
            long: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        (err) => {
          console.error("DEBUG [E]: GPS Error:", err.message);
        },
        { enableHighAccuracy: true },
      );
    }
  }, []);

  // --- LOGIC: Kamera Selfie ---
  const startCamera = async () => {
    console.log("DEBUG [5]: Menjalankan Fungsi Kamera Selfie...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      console.log("DEBUG [6]: Kamera Berhasil Aktif.");
    } catch (err) {
      console.error("DEBUG [E]: Gagal Akses Kamera:", err);
      alert("Gagal mengakses kamera depan.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      console.log("DEBUG [7]: Kamera Dimatikan.");
    }
  };

  // --- LOGIC: Kirim ke API ---
  const sendAttendance = async (photoBlob: Blob) => {
    console.log("DEBUG [8]: Menyiapkan Pengiriman Data ke Laravel...");
    setIsLoading(true);
    setStep(4);

    const formData = new FormData();
    formData.append("schedule_id", String(scheduleId));
    formData.append("qr_payload", qrData || "");
    formData.append("photo", photoBlob, "selfie.jpg");
    formData.append("lat_check", location?.lat.toString() || "");
    formData.append("long_check", location?.long.toString() || "");

    try {
      const response = await api.post("/test-absen", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("DEBUG [9]: API Berhasil!", response.data);
      setStatusMessage({ type: "success", text: response.data.message });
      setTimeout(() => router.push("/"), 3000);
    } catch (err: any) {
      console.error("DEBUG [E]: API Gagal:", err.response?.data);
      setStatusMessage({
        type: "error",
        text: err.response?.data?.message || "Gagal mengirim absensi.",
      });
    } finally {
      setIsLoading(false);
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
          if (blob) sendAttendance(blob);
        },
        "image/jpeg",
        0.8,
      );
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-6 text-slate-800">
      <div className="w-full max-w-md flex justify-between items-center mb-10 mt-4">
        <button
          onClick={() => router.push("/")}
          className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </button>
        <div className="text-right">
          <h1 className="text-lg font-bold">Presensi Kehadiran</h1>
          <p className="text-xs text-slate-400">ID: #{scheduleId}</p>
        </div>
      </div>

      <div className="w-full max-w-md bg-slate-50 rounded-[2.5rem] p-4 border border-slate-100 shadow-xl">
        {step === 1 && (
          <div className="py-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg mb-6">
              <ScanLine className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Siap Mengajar?</h2>
            <button
              onClick={() => setStep(2)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold"
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
            <p className="text-center mt-4 text-sm text-slate-500 italic">
              Scan QR Ruangan
            </p>
            {/* Tombol darurat jika scanner tidak muncul di Vercel */}
            <button
              onClick={() => {
                setQrData("MANUAL-TEST");
                setStep(3);
                startCamera();
              }}
              className="mt-4 w-full text-xs text-slate-400 underline"
            >
              Lewati Scan (Hanya untuk Tes)
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center">
            <div className="relative w-full aspect-[3/4] bg-black rounded-3xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <button
              onClick={takeSelfie}
              className="mt-6 w-16 h-16 bg-white border-4 border-blue-600 rounded-full shadow-lg"
            ></button>
          </div>
        )}

        {step === 4 && (
          <div className="py-10 text-center">
            {isLoading ? (
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
            ) : statusMessage?.type === "success" ? (
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            ) : (
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            )}
            <p className="mt-4 font-bold">
              {isLoading ? "Memproses..." : statusMessage?.text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
