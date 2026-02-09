"use client";
import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "@/lib/axios";
import { Camera, MapPin, ScanLine, UserCheck, Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function AbsensiPage() {
  const [step, setStep] = useState(1); // 1: Standby, 2: Scan QR, 3: Selfie, 4: Loading/Result
  const [location, setLocation] = useState<{
    lat: number;
    long: number;
  } | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null); // Ref untuk mematikan kamera

  // --- EFFECT: Ambil Lokasi ---
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, long: pos.coords.longitude });
      });
    }
  }, []);

  // --- LOGIC: Navigasi Kembali (Smart Back) ---
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      // Matikan stream kamera sebelum kembali ke scan QR
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setStep(2);
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
          if (scanner) {
            scanner.clear().then(() => {
              setStep(3);
              startCamera();
            }).catch((err) => console.error("Failed to clear scanner", err));
          }
        },
        (error) => { },
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch((err) => console.error("Cleanup failed", err));
      }
    };
  }, [step]);

  // --- LOGIC: Kamera Selfie ---
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream; // Simpan stream ke ref
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Gagal mengakses kamera: " + err);
    }
  };

  const takeSelfie = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);

      // Matikan kamera setelah foto diambil
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      canvasRef.current.toBlob((blob) => {
        if (blob) sendAttendance(blob);
      }, "image/jpeg");
    }
  };

  // --- LOGIC: Kirim ke Laravel ---
  const sendAttendance = async (photoBlob: Blob) => {
    setIsLoading(true);
    setStep(4);

    const formData = new FormData();
    formData.append("schedule_id", "1");
    formData.append("qr_payload", qrData || "");
    formData.append("photo", photoBlob, "selfie.jpg");
    formData.append("lat_check", location?.lat.toString() || "");
    formData.append("long_check", location?.long.toString() || "");
    formData.append("gps_accuracy", "10");

    try {
      const response = await api.post("/test-absen", formData);
      alert("Absensi Berhasil: " + response.data.message);
      window.location.href = "/"; // Gunakan navigasi balik ke dashboard
    } catch (err: any) {
      alert("Gagal: " + (err.response?.data?.message || "Terjadi kesalahan"));
      setStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-6 text-slate-800">

      {/* Header dengan Tombol Back Dinamis */}
      <div className="w-full max-w-md flex justify-between items-center mb-10 mt-4">
        <div className="flex items-center gap-4">
          {step > 1 && step < 4 && (
            <button
              onClick={handleBack}
              className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center active:scale-90 transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>
          )}
          {step === 1 && (
            <Link href="/" className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center active:scale-90 transition-all">
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </Link>
          )}
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {step === 3 ? "Verifikasi Wajah" : "Presensi Kehadiran"}
            </h1>
            <p className="text-sm text-slate-400">PWA Guru v1.0</p>
          </div>
        </div>
        <div className={`p-2 rounded-full ${location ? "bg-green-50" : "bg-red-50"}`}>
          <MapPin className={`w-5 h-5 ${location ? "text-green-500" : "text-red-500"}`} />
        </div>
      </div>

      <div className="w-full max-w-md bg-slate-50 rounded-[2.5rem] p-4 border border-slate-100 shadow-2xl shadow-slate-200">

        {/* STEP 1: Tombol Utama */}
        {step === 1 && (
          <div className="py-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center rotate-3 shadow-xl shadow-blue-200 mb-8">
              <ScanLine className="w-12 h-12 text-white -rotate-3" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-800">Selamat Pagi!</h2>
            <p className="text-slate-500 mb-10 px-6">
              Silakan tap tombol di bawah untuk memindai QR Code di ruangan.
            </p>
            <button
              onClick={() => setStep(2)}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg active:scale-95 transition-all"
            >
              Scan QR Code
            </button>
          </div>
        )}

        {/* STEP 2: Scanner QR */}
        {step === 2 && (
          <div className="p-2">
            <div id="reader" className="overflow-hidden rounded-3xl bg-black aspect-square"></div>
            <p className="text-center mt-6 font-medium text-slate-600 italic">
              Mencari kode QR...
            </p>
          </div>
        )}

        {/* STEP 3: Selfie */}
        {step === 3 && (
          <div className="flex flex-col items-center">
            <div className="relative w-full aspect-[3/4] bg-black rounded-3xl overflow-hidden shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute inset-0 border-[12px] border-white/20 rounded-3xl pointer-events-none"></div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <h3 className="mt-6 font-bold text-lg">Siap untuk Foto?</h3>
            <p className="text-slate-400 text-sm mb-8 text-center px-4">
              Wajah harus berada di dalam bingkai dan terlihat jelas.
            </p>
            <button
              onClick={takeSelfie}
              className="w-20 h-20 bg-white border-8 border-blue-600 rounded-full active:scale-90 transition-all shadow-lg"
            ></button>
          </div>
        )}

        {/* STEP 4: Loading */}
        {step === 4 && (
          <div className="py-20 flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="font-bold text-lg">Mengirim Data...</p>
            <p className="text-slate-400 text-sm">Mohon tunggu sebentar</p>
          </div>
        )}
      </div>
    </div>
  );
}