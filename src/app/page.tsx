import {
  Bell,
  MapPin,
  BookOpen,
  Clock,
  Layers,
  UserPlus,
  Info,
  BarChart2,
  FileText,
  Syringe,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

import Link from "next/link";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <div className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-100 border-2 border-white shadow-sm">
            <img src="https://i.pravatar.cc/150?u=teacher" alt="avatar" />
          </div>
          <div>
            <p className="text-slate-400 text-xs">Selamat Pagi,</p>
            <h1 className="text-slate-800 font-bold text-lg">
              Guru Budi Santoso
            </h1>
          </div>
        </div>
        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
          <Bell className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* Live Location Card */}
      <div className="px-6 mb-8">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-50 flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">
                Live Location
              </span>
            </div>
            <h2 className="text-slate-800 font-bold">SMK Negeri 1 Jakarta</h2>
            <p className="text-slate-400 text-[10px]">
              Anda berada di area sekolah
            </p>
            <button className="flex items-center gap-2 text-indigo-600 text-xs font-bold pt-2">
              <BookOpen className="w-3 h-3" /> Lihat Detail Presensi
            </button>
          </div>
          <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden grayscale opacity-50">
            <img
              src="https://www.google.com/maps/d/u/0/thumbnail?mid=1_KkG8R_S_r_U0_U_K_K_K_K_K_K"
              alt="map"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Schedule Section */}
      <div className="px-6 mb-6">
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-bold text-slate-800 text-xl">Jadwal Hari Ini</h3>
          <button className="text-indigo-600 text-xs font-bold">
            Lihat Kalender
          </button>
        </div>

        {/* Active Class */}
        <div className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
            <BookOpen className="text-indigo-600 w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              Sedang Berlangsung
            </p>
            <h4 className="font-bold text-slate-800">Matematika Wajib</h4>
            <p className="text-slate-400 text-xs">Kelas 10-A • Sesi 1</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
              <Layers className="text-orange-400 w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Ruang 302</h4>
              <p className="text-slate-400 text-[10px]">Gedung B, Lt. 3</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <Clock className="text-blue-400 w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">
                08:00 - 09:30
              </h4>
              <p className="text-slate-400 text-[10px]">Sisa 45 menit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Summary Cards */}
      <div className="px-6 grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[9px] font-bold uppercase">
              Total Jam
            </p>
            <h4 className="font-bold text-slate-800 text-xl">6 Jam</h4>
          </div>
          <BarChart2 className="w-5 h-5 text-slate-200" />
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[9px] font-bold uppercase">
              Persetujuan
            </p>
            <h4 className="font-bold text-slate-800 text-xl">2 Pending</h4>
          </div>
          <UserPlus className="w-5 h-5 text-slate-200" />
        </div>
      </div>

      {/* Section Layanan Guru */}
      <div className="px-6 mb-8">
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-bold text-slate-800 text-xl">Layanan Guru</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Tombol ke Halaman Izin */}
          <Link href="/izin" className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm active:scale-95 transition-all flex flex-col gap-3">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
              <FileText className="text-amber-500 w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Pengajuan Izin</h4>
              <p className="text-slate-400 text-[10px]">Sakit atau keperluan lain</p>
            </div>
          </Link>

          {/* Tombol Dummy Layanan Lain (Misal: Slip Gaji/Sertifikat) */}
          <button className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm active:scale-95 transition-all flex flex-col gap-3 opacity-60">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <Syringe className="text-emerald-500 w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Info Kesehatan</h4>
              <p className="text-slate-400 text-[10px]">Data vaksin & kesehatan</p>
            </div>
          </button>
        </div>
      </div>

      {/* Warning/Info Toast */}
      <div className="px-6">
        <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-3xl flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-600 shrink-0" />
          <p className="text-indigo-600 text-[10px] leading-relaxed font-medium">
            Jangan lupa scan QR keluar saat jam mengajar berakhir untuk mencatat
            kehadiran harian.
          </p>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
