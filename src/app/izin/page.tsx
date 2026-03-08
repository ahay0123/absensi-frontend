"use client";
import { ChevronLeft, Camera, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import api from "@/lib/axios";
import Alert, { useAlert } from "@/components/Alert";

// Type mapping from frontend to backend
const TYPE_MAPPING: { [key: string]: string } = {
  "Sakit (Dengan Surat Dokter)": "Sakit",
  "Izin Alasan Penting": "Izin",
  "Tugas Luar Sekolah": "Cuti",
};

export default function IzinPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [leaveType, setLeaveType] = useState<string>("Sakit (Dengan Surat Dokter)");
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { alert, showAlert, hideAlert } = useAlert();

  // Fungsi untuk memicu input file
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Fungsi saat file dipilih
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showAlert("error", "Ukuran file maksimal 5MB");
        return;
      }

      // Validate file type
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        showAlert("error", "Format file harus JPG, JPEG, atau PNG");
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Fungsi untuk submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!leaveType) {
      showAlert("error", "Silakan pilih jenis izin");
      return;
    }

    if (!reason || reason.trim().length < 10) {
      showAlert("error", "Alasan minimal 10 karakter");
      return;
    }

    if (!selectedFile) {
      showAlert("error", "Silakan unggah bukti foto");
      return;
    }

    setLoading(true);

    try {
      // Prepare FormData
      const formData = new FormData();
      formData.append("type", TYPE_MAPPING[leaveType]);
      formData.append("reason", reason.trim());
      formData.append("proof", selectedFile);

      const response = await api.post("/leave-requests", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        showAlert("success", response.data.message);

        // Reset form after successful submission
        setTimeout(() => {
          setLeaveType("Sakit (Dengan Surat Dokter)");
          setReason("");
          setSelectedFile(null);
          setPreviewUrl(null);
        }, 1500);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Gagal mengirim pengajuan izin. Silakan coba lagi.";
      showAlert("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white overflow-y-auto pb-10">
      {/* Alert Component */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={hideAlert}
        />
      )}

      <div className="p-6 flex items-center justify-between sticky top-0 bg-white z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center active:scale-90 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-slate-800" />
          </Link>
          <h1 className="font-bold text-slate-800 text-lg">Pengajuan Izin</h1>
        </div>
        <Link
          href="/izin/riwayat"
          className="text-sm font-bold text-indigo-600 hover:text-indigo-700 active:scale-95 transition-all px-4 py-2 bg-indigo-50 rounded-xl"
        >
          Riwayat
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Jenis Izin */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Jenis Izin
          </label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600 transition-all outline-none appearance-none"
            disabled={loading}
          >
            <option>Sakit (Dengan Surat Dokter)</option>
            <option>Izin Alasan Penting</option>
            <option>Tugas Luar Sekolah</option>
          </select>
        </div>

        {/* Alasan */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Alasan/Keterangan
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tuliskan alasan detail di sini..."
            rows={4}
            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600 transition-all outline-none resize-none"
            disabled={loading}
            minLength={10}
            maxLength={1000}
          />
          <p className="text-xs text-slate-400 text-right">
            {reason.length}/1000 karakter
          </p>
        </div>

        {/* Upload Bukti */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Unggah Bukti
          </label>

          {/* Input File Tersembunyi */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment" // Ini memicu kamera langsung di HP
            className="hidden"
            disabled={loading}
          />

          <div
            onClick={loading ? undefined : handleUploadClick}
            className={`w-full aspect-video bg-indigo-50/50 border-2 border-dashed border-indigo-100 rounded-3xl flex flex-col items-center justify-center gap-2 group transition-all overflow-hidden relative ${loading ? "cursor-not-allowed opacity-50" : "cursor-pointer active:bg-indigo-100"
              }`}
          >
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                {!loading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewUrl(null);
                      setSelectedFile(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-active:scale-90 transition-all">
                  <Camera className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter text-center px-4">
                  Klik untuk Ambil Foto Surat / Pilih File
                </p>
              </>
            )}
          </div>
        </div>

        {/* Tombol Kirim */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-bold py-5 rounded-2xl shadow-lg shadow-indigo-100 active:scale-95 transition-all mt-4 mb-10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Mengirim...
            </>
          ) : (
            "Kirim Pengajuan"
          )}
        </button>
      </form>
    </main>
  );
}
