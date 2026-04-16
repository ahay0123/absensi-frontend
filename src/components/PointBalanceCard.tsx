// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT: PointBalance
// Menampilkan kartu saldo poin dengan ringkasan statistik
// ═══════════════════════════════════════════════════════════════════════════

import React from "react";
import { TrendingUp } from "lucide-react";
import { PointBalance, PointSummary } from "@/types/point";

interface PointBalanceProps {
  balance: PointBalance | null;
  summary: PointSummary | null;
  isLoading?: boolean;
}

export default function PointBalanceCard({
  balance,
  summary,
  isLoading = false,
}: PointBalanceProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-100 p-6 space-y-4">
        <div className="h-12 bg-slate-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!balance || !summary) {
    return (
      <div className="bg-white rounded-lg border border-slate-100 p-6 text-center text-slate-500">
        Data tidak tersedia
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-100 p-6 space-y-6">
      {/* Main Balance Section */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-2">
            Saldo Poin Anda
          </p>
          <div className="flex items-baseline gap-2">
            <h1 className="text-4xl font-bold text-indigo-600">
              {balance.balance.toLocaleString("id-ID")}
            </h1>
            <span className="text-sm text-slate-600">poin</span>
          </div>
        </div>
        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Earned */}
        <div className="bg-white/60 rounded-lg p-3 border border-white/40 backdrop-blur-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Diperoleh</p>
          <p className="text-lg font-bold text-green-600">
            +{summary.total_earned}
          </p>
        </div>

        {/* Total Penalty */}
        <div className="bg-white/60 rounded-lg p-3 border border-white/40 backdrop-blur-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Pengurangan</p>
          <p className="text-lg font-bold text-red-600">
            {summary.total_penalty}
          </p>
        </div>

        {/* Total Spent */}
        <div className="bg-white/60 rounded-lg p-3 border border-white/40 backdrop-blur-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Digunakan</p>
          <p className="text-lg font-bold text-blue-600">
            {summary.total_spent}
          </p>
        </div>

        {/* Current Balance */}
        <div className="bg-white/60 rounded-lg p-3 border border-white/40 backdrop-blur-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Saldo</p>
          <p className="text-lg font-bold text-slate-700">{balance.balance}</p>
        </div>
      </div>

      {/* Info Message */}
      <div className="bg-white/80 rounded-lg p-3 border border-indigo-200 text-sm text-slate-600">
        <p className="font-medium text-slate-700 mb-1">Apa itu Poin?</p>
        <p>
          Poin diperoleh dari kehadiran tepat waktu dan dapat ditukar dengan
          token privileges di marketplace.
        </p>
      </div>
    </div>
  );
}
