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
  monthly_data?: number[];
}

export default function StatsPage() {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  // State for Month and Year filter
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/attendance-stats?month=${selectedMonth}&year=${selectedYear}`);
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
          monthly_data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedMonth, selectedYear]); // Refetch when month or year changes

  const percentage = stats?.percentage || 0;
  const hadir = stats?.hadir || 0;
  const terlambat = stats?.terlambat || 0;
  const izin = stats?.izin || 0;
  const alpa = stats?.alpa || 0;
  const improvement = stats?.improvement || 0;
  const monthlyData = stats?.monthly_data || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  // Helper arrays for filters
  const months = [
    { value: 1, label: "Januari", short: "Jan" },
    { value: 2, label: "Februari", short: "Feb" },
    { value: 3, label: "Maret", short: "Mar" },
    { value: 4, label: "April", short: "Apr" },
    { value: 5, label: "Mei", short: "Mei" },
    { value: 6, label: "Juni", short: "Jun" },
    { value: 7, label: "Juli", short: "Jul" },
    { value: 8, label: "Agustus", short: "Ags" },
    { value: 9, label: "September", short: "Sep" },
    { value: 10, label: "Oktober", short: "Okt" },
    { value: 11, label: "November", short: "Nov" },
    { value: 12, label: "Desember", short: "Des" },
  ];

  // Generate last 5 years for dropdown
  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

  return (
    <main className="min-h-screen p-6 pb-28 bg-slate-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Statistik
        </h1>

        {/* Filter Dropdowns */}
        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm appearance-none font-medium"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm appearance-none font-medium"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* Hero Card: Kehadiran Utama */}
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white mb-6 relative overflow-hidden shadow-xl shadow-indigo-200">
            <div className="relative z-10">
              <p className="text-indigo-100 text-sm font-medium">
                Persentase Kehadiran
              </p>
              <h2 className="text-5xl font-black mt-2">{percentage.toFixed(1)}%</h2>
              <p className="text-indigo-200 text-xs mt-4 flex items-center gap-1">
                <ArrowUpRight className={`w-4 h-4 ${improvement >= 0 ? "text-green-300" : "text-red-300 transform rotate-90"}`} />
                <span>
                  {Math.abs(improvement).toFixed(1)}% {improvement >= 0 ? "lebih baik" : "lebih buruk"} dari bulan lalu
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

          {/* Info Bulanan */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-x-auto">
            <div className="flex justify-between items-center mb-4 min-w-[300px]">
              <h3 className="font-bold text-slate-800">Tren Kehadiran Tahunan</h3>
              <Calendar className="w-4 h-4 text-slate-300" />
            </div>
            <div className="flex items-end justify-between h-32 gap-1 px-1 min-w-[300px]">
              {/* Dynamic Bar Chart based on monthly_data returned from API */}
              {monthlyData.map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group cursor-pointer relative h-full">
                  {/* Tooltip for percentage */}
                  <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-2 rounded font-bold pointer-events-none z-10">
                    {height}%
                  </div>
                  <div
                    className={`w-full max-w-[12px] rounded-t-lg transition-all duration-700 ease-out ${i + 1 === selectedMonth
                      ? "bg-indigo-600 shadow-md shadow-indigo-200"
                      : height > 0 ? "bg-indigo-200 hover:bg-indigo-400" : "bg-slate-100"
                      }`}
                    style={{ height: `${Math.max(height, 5)}%` }}
                  ></div>
                  <span className={`text-[8px] font-bold ${i + 1 === selectedMonth ? "text-indigo-600" : "text-slate-400"}`}>
                    {months[i].short}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <BottomNav />
    </main>
  );
}
