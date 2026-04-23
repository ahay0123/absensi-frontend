// ═══════════════════════════════════════════════════════════════════════════
// PAGE: Admin Leaderboard & Analytics
// Tabel Analitik Integritas - Leaderboard bulan ini
// ═══════════════════════════════════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Download, RefreshCw, ArrowLeft } from "lucide-react";
import IntegrityLeaderboard, {
  IntegrityLeaderboardSkeleton,
} from "@/components/IntegrityLeaderboard";
import Alert from "@/components/Alert";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { exportLeaderboard } from "@/services/adminAnalyticsService";

export default function AdminLeaderboardPage() {
  const router = useRouter();
  const {
    topUsers,
    bottomUsers,
    summary,
    period,
    month,
    year,
    isLoading,
    error,
    changeMonth,
    refetch,
  } = useLeaderboard();

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

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

  const currentDate = new Date();
  const years = [
    currentDate.getFullYear() - 1,
    currentDate.getFullYear(),
    currentDate.getFullYear() + 1,
  ];

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportError(null);
      await exportLeaderboard(month, year);
    } catch (err: any) {
      setExportError(err.message || "Gagal mengexport data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-2 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-semibold">Kembali</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            📊 Analitik Integritas
          </h1>
          <p className="text-slate-600">
            Pantau ranking integritas dan performa pengguna
          </p>
        </div>

        {/* Summary Cards */}
        {summary && !isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
              <p className="text-sm text-slate-600">Total Pengguna</p>
              <p className="text-3xl font-black text-blue-600">
                {summary.total_users}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
              <p className="text-sm text-slate-600">Total Poin Terdistribusi</p>
              <p className="text-3xl font-black text-green-600">
                {summary.total_points_distributed.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
              <p className="text-sm text-slate-600">Rata-rata Per Pengguna</p>
              <p className="text-3xl font-black text-purple-600">
                {summary.average_points_per_user.toLocaleString("id-ID", {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
              <p className="text-sm text-slate-600">Top Performer</p>
              <p className="text-lg font-bold text-slate-900">
                {summary.top_performer.name}
              </p>
              <p className="text-xs text-yellow-600 font-semibold">
                🥇 {summary.top_performer.total_points.toLocaleString("id-ID")}{" "}
                poin
              </p>
            </div>
          </div>
        )}

        {/* Period Selector & Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  Bulan
                </label>
                <select
                  value={month}
                  onChange={(e) => changeMonth(parseInt(e.target.value), year)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {months.map((m, idx) => (
                    <option key={idx} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  Tahun
                </label>
                <select
                  value={year}
                  onChange={(e) => changeMonth(month, parseInt(e.target.value))}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {period && (
                <div className="flex items-end">
                  <p className="text-sm font-medium text-slate-600">{period}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={refetch}
                disabled={isLoading}
                className="flex-1 sm:flex-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-900 text-sm font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>

              <button
                onClick={handleExport}
                disabled={isLoading || isExporting}
                className="flex-1 sm:flex-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="mb-8">
            <Alert
              type="error"
              message={error}
              onClose={() => {}}
              duration={0}
            />
          </div>
        )}

        {exportError && (
          <div className="mb-8">
            <Alert
              type="error"
              message={exportError}
              onClose={() => setExportError(null)}
              duration={0}
            />
          </div>
        )}

        {/* Leaderboard */}
        {isLoading ? (
          <IntegrityLeaderboardSkeleton />
        ) : topUsers.length === 0 && bottomUsers.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg font-semibold">
              Belum ada data
            </p>
            <p className="text-slate-500 text-sm">
              Leaderboard akan muncul ketika ada aktivitas pengguna
            </p>
          </div>
        ) : (
          <IntegrityLeaderboard
            topUsers={topUsers}
            bottomUsers={bottomUsers}
            period={period}
            isLoading={false}
          />
        )}

        {/* Info Section */}
        <div className="mt-12 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-black text-slate-900">
              💡 Tips Menggunakan Leaderboard
            </h2>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex gap-3">
                <span className="text-lg min-w-fit">1️⃣</span>
                <span>
                  Pantau <strong>Top 3</strong> pengguna untuk memberikan pujian
                  dan recognition atas integritas mereka
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-lg min-w-fit">2️⃣</span>
                <span>
                  Fokus pada daftar <strong>"Perhatian Diperlukan"</strong>{" "}
                  untuk memberikan bimbingan dan dukungan
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-lg min-w-fit">3️⃣</span>
                <span>
                  Gunakan data <strong>bulan ke bulan</strong> untuk melacak
                  perkembangan dan tren integritas
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-lg min-w-fit">4️⃣</span>
                <span>
                  <strong>Export CSV</strong> untuk membuat laporan atau
                  analisis lebih lanjut
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-lg min-w-fit">5️⃣</span>
                <span>
                  Gunakan analytics untuk membuat keputusan yang lebih baik
                  dalam HR dan evaluasi kinerja
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
