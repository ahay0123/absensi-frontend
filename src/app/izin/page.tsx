"use client";
import { ChevronLeft, UploadCloud, X, Camera } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";

export default function IzinPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fungsi untuk memicu input file
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Fungsi saat file dipilih
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    // Tambahkan overflow-y-auto dan pb-10 agar bisa scroll sampai bawah
    <main className="min-h-screen bg-white overflow-y-auto pb-10">
      <div className="p-6 flex items-center gap-4 sticky top-0 bg-white z-10">
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center active:scale-90 transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-slate-800" />
        </Link>
        <h1 className="font-bold text-slate-800 text-lg">Pengajuan Izin</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Jenis Izin */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Jenis Izin
          </label>
          <select className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600 transition-all outline-none appearance-none">
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
            placeholder="Tuliskan alasan detail di sini..."
            rows={4}
            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600 transition-all outline-none resize-none"
          />
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
          />

          <div
            onClick={handleUploadClick}
            className="w-full aspect-video bg-indigo-50/50 border-2 border-dashed border-indigo-100 rounded-3xl flex flex-col items-center justify-center gap-2 group active:bg-indigo-100 transition-all cursor-pointer overflow-hidden relative"
          >
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewUrl(null);
                    setSelectedFile(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
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
        <button className="w-full bg-indigo-600 text-white font-bold py-5 rounded-2xl shadow-lg shadow-indigo-100 active:scale-95 transition-all mt-4 mb-10">
          Kirim Pengajuan
        </button>
      </div>
    </main>
  );
}
