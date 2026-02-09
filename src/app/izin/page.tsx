import { ChevronLeft, UploadCloud } from "lucide-react";
import Link from "next/link";

export default function IzinPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="p-6 flex items-center gap-4">
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-slate-800" />
        </Link>
        <h1 className="font-bold text-slate-800 text-lg">Pengajuan Izin</h1>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Jenis Izin
          </label>
          <select className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600 transition-all outline-none">
            <option>Sakit (Dengan Surat Dokter)</option>
            <option>Izin Alasan Penting</option>
            <option>Tugas Luar Sekolah</option>
          </select>
        </div>

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

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Unggah Bukti
          </label>
          <div className="w-full aspect-video bg-indigo-50/50 border-2 border-dashed border-indigo-100 rounded-3xl flex flex-col items-center justify-center gap-2 group active:bg-indigo-100 transition-all cursor-pointer">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-active:scale-90 transition-all">
              <UploadCloud className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">
              Pilih File atau Foto
            </p>
          </div>
        </div>

        <button className="w-full bg-indigo-600 text-white font-bold py-5 rounded-2xl shadow-lg shadow-indigo-100 active:scale-95 transition-all mt-4">
          Kirim Pengajuan
        </button>
      </div>
    </main>
  );
}
