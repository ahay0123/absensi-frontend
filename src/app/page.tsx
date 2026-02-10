"use client";
import React, { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import api from "@/lib/axios";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // 1. Ambil data dari API
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard-data");
        // Log untuk debug di console browser (F12)
        console.log("Response Backend:", response.data);
        setData(response.data);
      } catch (err) {
        console.error("Gagal mengambil data dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();

    // 2. Update waktu lokal setiap detik untuk sinkronisasi jadwal yang presisi
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format waktu sekarang ke HH:mm:ss untuk perbandingan akurat dengan format 07:00:00
  const nowStr =
    currentTime.getHours().toString().padStart(2, "0") +
    ":" +
    currentTime.getMinutes().toString().padStart(2, "0") +
    ":" +
    currentTime.getSeconds().toString().padStart(2, "0");

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );

  return (
    <main className="min-h-screen bg-slate-50 pb-32">
      {/* --- HEADER --- */}
      <div className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-100 border-2 border-white shadow-sm">
            <img
              src={data?.user?.avatar || "https://i.pravatar.cc/150"}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Selamat Pagi,</p>
            <h1 className="text-slate-800 font-bold text-lg leading-tight">
              {data?.user?.name || "Guru"}
            </h1>
          </div>
        </div>
        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 relative active:scale-90 transition-all">
          <Bell className="w-5 h-5 text-slate-600" />
          {data?.stats?.pending_leaves > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>
      </div>

      {/* --- LIVE LOCATION CARD --- */}
      <div className="px-6 mb-8">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-50 flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">
                Live Location
              </span>
            </div>
            <h2 className="text-slate-800 font-bold">
              {data?.school?.name || "Sekolah"}
            </h2>
            <p className="text-slate-400 text-[10px]">
              Presensi di radius {data?.school?.radius_meters || 100}m dari
              pusat
            </p>
          </div>
          <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden grayscale opacity-50 flex items-center justify-center">
            <MapPin className="text-slate-300 w-8 h-8" />
          </div>
        </div>
      </div>

      {/* --- DYNAMIC SCHEDULE SECTION --- */}
      <div className="px-6 mb-6">
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-bold text-slate-800 text-xl">Jadwal Hari Ini</h3>
          <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase">
            {nowStr} WIB
          </span>
        </div>

        <div className="space-y-4">
          {data?.schedules && data.schedules.length > 0 ? (
            data.schedules.map((schedule: any) => {
              // Logika Status: Membandingkan HH:mm:ss vs HH:mm:ss
              const isActive =
                nowStr >= schedule.start_time && nowStr <= schedule.end_time;
              const isPast = nowStr > schedule.end_time;

              return (
                <div
                  key={schedule.id}
                  className={`transition-all duration-500 rounded-[2rem] p-5 border ${
                    isActive
                      ? "bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-200 text-white scale-[1.02] z-10 relative"
                      : "bg-white border-slate-100 text-slate-800"
                  } ${isPast ? "opacity-40 grayscale" : "opacity-100"}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        isActive ? "bg-white/20 shadow-inner" : "bg-indigo-50"
                      }`}
                    >
                      <BookOpen
                        className={`w-6 h-6 ${isActive ? "text-white" : "text-indigo-600"}`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="truncate">
                          <p
                            className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                              isActive ? "text-indigo-100" : "text-slate-400"
                            }`}
                          >
                            {isActive
                              ? " Sedang Berlangsung"
                              : isPast
                                ? "Selesai"
                                : "Mendatang"}
                          </p>
                          <h4 className="font-bold text-sm sm:text-base truncate">
                            {schedule.subject?.name || "Mata Pelajaran"}
                          </h4>
                        </div>
                        <div
                          className={`text-right shrink-0 ${isActive ? "text-white" : "text-slate-400"}`}
                        >
                          {/* Menampilkan jam tanpa detik agar UI tetap bersih (07:00) */}
                          <p className="text-xs font-bold leading-none">
                            {schedule.start_time.substring(0, 5)} -{" "}
                            {schedule.end_time.substring(0, 5)}
                          </p>
                          <p className="text-[9px] font-medium opacity-70 mt-1">
                            {schedule.room?.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-indigo-100" />
                        <span className="text-[10px] font-medium text-indigo-100">
                          Waktunya Mengajar
                        </span>
                      </div>
                      <Link
                        href={`/presensi-guru/${schedule.id}`}
                        className="bg-white text-indigo-600 text-[10px] font-bold px-4 py-2 rounded-xl shadow-sm active:scale-90 transition-all"
                      >
                        Mulai Absensi
                      </Link>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white p-10 rounded-[2.5rem] text-center border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-slate-400 text-sm font-medium px-4">
                Tidak ada jadwal mengajar untuk Anda hari ini.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- STATS SUMMARY --- */}
      <div className="px-6 grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-[2rem] p-5 border border-slate-100 flex items-center justify-between group active:bg-indigo-50 transition-all">
          <div>
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-tight">
              Total Jam
            </p>
            <h4 className="font-bold text-slate-800 text-xl">
              {data?.stats?.total_hours || 0} Jam
            </h4>
          </div>
          <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center group-active:bg-white">
            <BarChart2 className="w-5 h-5 text-indigo-500" />
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-5 border border-slate-100 flex items-center justify-between group active:bg-orange-50 transition-all">
          <div>
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-tight">
              Izin Pending
            </p>
            <h4 className="font-bold text-orange-500 text-xl">
              {data?.stats?.pending_leaves || 0}
            </h4>
          </div>
          <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center group-active:bg-white">
            <UserPlus className="w-5 h-5 text-orange-400" />
          </div>
        </div>
      </div>

      {/* --- LAYANAN GURU --- */}
      <div className="px-6 mb-8">
        <h3 className="font-bold text-slate-800 text-xl mb-4">Layanan Guru</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/izin"
            className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm active:scale-95 active:shadow-none transition-all flex flex-col gap-3"
          >
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
              <FileText className="text-amber-500 w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm leading-none">
                Pengajuan Izin
              </h4>
              <p className="text-slate-400 text-[9px] mt-1 italic">
                Sakit / Keperluan
              </p>
            </div>
          </Link>
          <button className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm active:scale-95 opacity-60 transition-all flex flex-col gap-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <Syringe className="text-emerald-500 w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm leading-none">
                Info Kesehatan
              </h4>
              <p className="text-slate-400 text-[9px] mt-1 italic">
                Update Segera
              </p>
            </div>
          </button>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
