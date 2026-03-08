"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, Clock, Filter, Loader2, Camera, X } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import api from "@/lib/axios";

interface HistoryItem {
  id: number;
  date: string;
  time: string;
  status: string;
  subject: string;
  room: string;
  photo: string | null;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [originalHistory, setOriginalHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    hadir: 0,
    terlambat: 0,
    percentage: 0,
  });

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const [filters, setFilters] = useState({
    month: currentMonth,
    year: currentYear,
    status: "all", // all, hadir, terlambat, absen
  });

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const statuses = [
    { value: "all", label: "Semua Status" },
    { value: "Hadir", label: "Hadir" },
    { value: "Terlambat", label: "Terlambat" },
    { value: "Absen", label: "Absen" },
  ];

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [historyRes, statsRes] = await Promise.all([
          api.get("/attendance-history"),
          api.get("/attendance-stats"),
        ]);
        setOriginalHistory(historyRes.data.data);
        setHistory(historyRes.data.data);
        setStats(statsRes.data.stats);
      } catch (err) {
        console.error("Error loading history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Apply filters when filter state changes
  useEffect(() => {
    let filtered = originalHistory;

    // Filter by month and year
    filtered = filtered.filter((item) => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getMonth() === filters.month &&
        itemDate.getFullYear() === filters.year
      );
    });

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    setHistory(filtered);
  }, [filters, originalHistory]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="p-6 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-20">
        <Link
          href="/"
          className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-slate-800" />
        </Link>
        <h1 className="font-bold text-slate-800">Riwayat Presensi</h1>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
            showFilter ? "bg-indigo-600 border-indigo-600" : "border-slate-100"
          }`}
        >
          <Filter
            className={`w-4 h-4 ${
              showFilter ? "text-white" : "text-slate-800"
            }`}
          />
        </button>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="bg-white border-b border-slate-100 p-6 space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-800 mb-2 block">
              Pilih Bulan
            </label>
            <select
              value={filters.month}
              onChange={(e) =>
                handleFilterChange("month", parseInt(e.target.value))
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
            >
              {months.map((month, idx) => (
                <option key={idx} value={idx}>
                  {month} {filters.year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-800 mb-2 block">
              Filter Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleFilterChange("status", status.value)}
                  className={`py-2 px-3 rounded-xl text-[10px] font-bold transition-all ${
                    filters.status === status.value
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Card */}
      <div className="p-6">
        <div className="bg-indigo-600 rounded-[2.5rem] p-6 text-white shadow-xl">
          <h3 className="text-sm font-medium text-indigo-100 mb-3">
            Statistik Kehadiran
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-indigo-100">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.hadir}</p>
              <p className="text-xs text-indigo-100">Hadir</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.terlambat}</p>
              <p className="text-xs text-indigo-100">Terlambat</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-indigo-400">
            <p className="text-sm">
              Tingkat Kehadiran:{" "}
              <span className="font-bold text-lg">{stats.percentage}%</span>
            </p>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="px-6 space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-400 text-sm">
              Belum ada riwayat presensi untuk filter yang dipilih
            </p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between"
            >
              <div className="flex gap-4 items-center flex-1">
                {item.photo && (
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={item.photo}
                      alt="Selfie"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-1 flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm">
                    {item.date}
                  </h4>
                  <p className="text-slate-400 text-[10px] truncate">
                    {item.subject !== "-"
                      ? `${item.subject}`
                      : "Tidak Mengajar"}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-slate-500 font-bold text-[10px]">
                    <Clock className="w-3 h-3" /> {item.time}
                  </div>
                </div>
              </div>
              <div
                className={`px-4 py-2 rounded-2xl text-[10px] font-bold flex-shrink-0 ${
                  item.status === "Hadir"
                    ? "bg-green-50 text-green-600"
                    : item.status === "Terlambat"
                      ? "bg-orange-50 text-orange-600"
                      : "bg-red-50 text-red-600"
                }`}
              >
                {item.status}
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </main>
  );
}
