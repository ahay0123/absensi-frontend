"use client";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle,
  Clock,
  Calendar,
  Loader2,
  FileText,
  AlertTriangle,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import api from "@/lib/axios";

interface AttendanceStats {
  percentage?: number;
  hadir?: number;
  terlambat?: number;
  absen?: number;
  izin?: number;
  alpa?: number;
  improvement?: number;
  weekly_data?: number[];
}

export default function StatsPage() {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/attendance-stats");
        setStats(response.data.stats || response.data);
      } catch (err) {
        console.error("Error loading stats:", err);
        setStats({
          percentage: 0,
          hadir: 0,
          terlambat: 0,
          absen: 0,
          izin: 0,
          alpa: 0,
          improvement: 0,
          weekly_data: [0, 0, 0, 0, 0],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const percentage = stats?.percentage || 0;
  const hadir = stats?.hadir || 0;
  const terlambat = stats?.terlambat || 0;
  const izin = stats?.izin || 0;
  const alpa = stats?.alpa || 0;
  const improvement = stats?.improvement || 0;
  const weeklyData = stats?.weekly_data || [40, 70, 45, 90, 65];

  return (
    <main className="min-h-screen p-6 pb-28 bg-slate-50">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        Statistik Bulan Ini
      </h1>

      {/* Hero Card: Kehadiran Utama */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white mb-6 relative overflow-hidden shadow-xl shadow-indigo-200">
        <div className="relative z-10">
          <p className="text-indigo-100 text-sm font-medium">
            Persentase Kehadiran
          </p>
          <h2 className="text-5xl font-black mt-2">{percentage.toFixed(1)}%</h2>
          <p className="text-indigo-200 text-xs mt-4 flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4 text-green-300" />
            <span>
              {improvement.toFixed(1)}% {improvement >= 0 ? "lebih" : "kurang"}{" "}
              baik dari bulan lalu
            </span>
          </p>
        </div>
        {/* Dekorasi Aksen */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
          <CheckCircle className="text-emerald-500 w-8 h-8 mb-3" />
          <h4 className="text-3xl font-black text-slate-800">{hadir}</h4>
          <p className="text-slate-400 text-[10px] font-bold uppercase mt-1">
            Hadir
          </p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
          <Clock className="text-amber-500 w-8 h-8 mb-3" />
          <h4 className="text-3xl font-black text-slate-800">{terlambat}</h4>
          <p className="text-slate-400 text-[10px] font-bold uppercase mt-1">
            Terlambat
          </p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
          <FileText className="text-blue-500 w-8 h-8 mb-3" />
          <h4 className="text-3xl font-black text-slate-800">{izin}</h4>
          <p className="text-slate-400 text-[10px] font-bold uppercase mt-1">
            Izin / Sakit
          </p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
          <AlertTriangle className="text-red-500 w-8 h-8 mb-3" />
          <h4 className="text-3xl font-black text-slate-800">{alpa}</h4>
          <p className="text-slate-400 text-[10px] font-bold uppercase mt-1">
            Alpa
          </p>
        </div>
      </div>

      {/* Info Mingguan */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800">Aktivitas Mingguan</h3>
          <Calendar className="w-4 h-4 text-slate-300" />
        </div>
        <div className="flex items-end justify-between h-32 gap-2 px-2">
          {/* Dynamic Bar Chart */}
          {weeklyData.map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className={`w-full rounded-t-lg transition-all duration-500 ${i === 3 ? "bg-indigo-600" : "bg-indigo-100"}`}
                style={{ height: `${Math.max(height, 10)}%` }}
              ></div>
              <span className="text-[10px] font-bold text-slate-400">
                Min-{i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
