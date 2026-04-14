"use client";
import React, { useState, useEffect, useRef } from "react";
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

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isInRadius, setIsInRadius] = useState<boolean | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const hasFetched = useRef(false); // Prevent double fetch

  // Fungsi untuk menghitung jarak antar 2 koordinat (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371000; // Radius bumi dalam meter
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // jarak dalam meter
  };

  // Request geolocation dari browser
  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setUserLocation(loc);
          setLocationError(null);

          // Jika data sekolah sudah ada, cek apakah user di radius
          if (data?.school) {
            const distance = calculateDistance(
              loc.latitude,
              loc.longitude,
              parseFloat(data.school.latitude),
              parseFloat(data.school.longitude),
            );
            const radius = data.school.radius_meters || 100;
            setIsInRadius(distance <= radius);
          }
        },
        (error) => {
          setLocationError("Izin lokasi ditolak");
          console.error("Geolocation error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    } else {
      setLocationError("Browser tidak support Geolocation");
    }
  };

  useEffect(() => {
    // 0. Cek role — redirect kepala sekolah / admin ke halaman mereka
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        const rawRole = userObj?.role || '';
        const role = rawRole.toLowerCase().replace(/[\s_]+/g, '-');
        if (role === 'kepala-sekolah' || role === 'kepsek') {
          window.location.href = '/kepala-sekolah';
          return;
        } else if (role === 'admin') {
          window.location.href = '/admin';
          return;
        }
      } catch { /* ignore */ }
    }

    // 1. Ambil data dari API (hanya sekali)
    const fetchDashboard = async () => {
      // Skip jika sudah pernah fetch
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        // Tambahkan timestamp agar browser tidak menyimpan cache (selalu ambil data terbaru)
        const response = await api.get(
          `/dashboard-data?t=${new Date().getTime()}`,
        );
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

    // 3. Request lokasi saat component mount
    requestLocation();

    return () => clearInterval(timer);
  }, []); // Empty dependency array - hanya run sekali

  // Re-check radius ketika data atau user location berubah
  useEffect(() => {
    if (userLocation && data?.school) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        parseFloat(data.school.latitude),
        parseFloat(data.school.longitude),
      );
      const radius = data.school.radius_meters || 100;
      setIsInRadius(distance <= radius);
    }
  }, [userLocation, data?.school]);

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
            <p className="text-slate-400 text-xs font-medium">
              {currentTime.getHours() < 12
                ? "Selamat Pagi ☀️,"
                : currentTime.getHours() < 15
                  ? "Selamat Siang 🌤️,"
                  : currentTime.getHours() < 18
                    ? "Selamat Sore 🌅,"
                    : "Selamat Malam 🌙,"}
            </p>
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
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 ${isInRadius ? "bg-green-500 animate-pulse" : "bg-red-500"
                  } rounded-full`}
              ></div>
              <span
                className={`text-[10px] font-bold uppercase tracking-widest ${isInRadius ? "text-green-500" : "text-red-500"
                  }`}
              >
                {isInRadius === null
                  ? "Checking..."
                  : isInRadius
                    ? "Di Radius Sekolah ✓"
                    : "Diluar Radius"}
              </span>
            </div>
            <h2 className="text-slate-800 font-bold">
              {data?.school?.name || "Sekolah"}
            </h2>
            <p className="text-slate-400 text-[10px]">
              {userLocation && isInRadius !== null ? (
                <>
                  Radius {data?.school?.radius_meters || 100}m
                  {userLocation && (
                    <span className="ml-2">
                      (Akurasi: ±{Math.round(userLocation.accuracy)}m)
                    </span>
                  )}
                </>
              ) : (
                <>
                  Presensi di radius {data?.school?.radius_meters || 100}m dari
                  pusat
                </>
              )}
            </p>
          </div>
          <button
            onClick={requestLocation}
            className={`w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center transition-all active:scale-90 ${isInRadius
                ? "bg-green-50"
                : isInRadius === null
                  ? "bg-slate-100"
                  : "bg-red-50"
              }`}
          >
            <MapPin
              className={`w-8 h-8 ${isInRadius
                  ? "text-green-500"
                  : isInRadius === null
                    ? "text-slate-300"
                    : "text-red-500"
                }`}
            />
          </button>
        </div>
        {locationError && (
          <p className="text-[10px] text-red-500 mt-2 font-medium">
            {locationError} - Tap ikon lokasi untuk coba lagi
          </p>
        )}
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
                  className={`transition-all duration-500 rounded-[2rem] p-5 border ${isActive
                      ? "bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-200 text-white scale-[1.02] z-10 relative"
                      : "bg-white border-slate-100 text-slate-800"
                    } ${isPast ? "opacity-40 grayscale" : "opacity-100"}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isActive ? "bg-white/20 shadow-inner" : "bg-indigo-50"
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
                            className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isActive ? "text-indigo-100" : "text-slate-400"
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
