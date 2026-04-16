// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT: HeroBalanceSection
// E-Wallet style hero section dengan saldo besar dan level indicator (Disiplin Elite)
// ═══════════════════════════════════════════════════════════════════════════

import React from "react";
import { PointBalance, PointSummary } from "@/types/point";
import { getLevelProgress, formatPoints } from "@/lib/levelSystem";
import { TrendingUp, Zap } from "lucide-react";

interface HeroBalanceSectionProps {
  balance: PointBalance | null;
  summary: PointSummary | null;
  isLoading?: boolean;
}

export default function HeroBalanceSection({
  balance,
  summary,
  isLoading = false,
}: HeroBalanceSectionProps) {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-2xl p-8 space-y-6 shadow-lg">
        <div className="h-12 bg-white/20 rounded-lg animate-pulse w-48" />
        <div className="h-16 bg-white/20 rounded-lg animate-pulse w-64" />
        <div className="h-8 bg-white/20 rounded-lg animate-pulse w-40" />
      </div>
    );
  }

  if (!balance) {
    return (
      <div className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-2xl p-8 text-center">
        Data tidak tersedia
      </div>
    );
  }

  const levelProgress = summary
    ? getLevelProgress(balance.balance)
    : getLevelProgress(0);
  const nextLevelPoints = levelProgress.pointsUntilNext;

  return (
    <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 text-white rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 blur-3xl" />

      {/* Content - Relative to decorative background */}
      <div className="relative z-10 space-y-6">
        {/* Greeting + Name */}
        <div>
          <p className="text-indigo-100 text-sm font-medium">
            👋 Halo, {balance.name || "Guru"}!
          </p>
        </div>

        {/* Main Balance Display */}
        <div className="space-y-2">
          <p className="text-indigo-200 text-sm font-medium">Saldo Poin Anda</p>
          <div className="flex items-baseline gap-2">
            <h1 className="text-6xl md:text-7xl font-black">
              {balance.balance.toLocaleString("id-ID")}
            </h1>
            <span className="text-lg md:text-2xl font-bold text-indigo-200">
              poin
            </span>
          </div>
        </div>

        {/* Level Badge & Progress */}
        <div className="space-y-3 bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
          {/* Level Label */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-indigo-200 font-medium mb-1">
                Status Level
              </p>
              <p className="text-2xl font-bold">
                {levelProgress.current.icon} {levelProgress.current.label}
              </p>
              <p className="text-xs text-indigo-200 mt-1">
                {levelProgress.current.description}
              </p>
            </div>
            <style>{`
              .level-badge-pulse {
                animation: pulse-glow 2s ease-in-out infinite;
              }
              @keyframes pulse-glow {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
              }
            `}</style>
            <div className="text-5xl level-badge-pulse">
              {levelProgress.current.icon}
            </div>
          </div>

          {/* Progress Bar */}
          {levelProgress.next && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-indigo-200">
                  Menuju {levelProgress.next.label}
                </p>
                <p className="text-xs text-white font-semibold">
                  {Math.round(levelProgress.progressPercent)}%
                </p>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden border border-white/30">
                <div
                  className="h-full bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${levelProgress.progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-indigo-200">
                {nextLevelPoints} poin lagi untuk naik level
              </p>
            </div>
          )}

          {/* Max Level Indicator */}
          {!levelProgress.next && (
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>Anda sudah mencapai level maksimal! 🎉</span>
            </div>
          )}
        </div>

        {/* Stats Row */}
        {summary && (
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20 text-center">
              <p className="text-xs text-indigo-200 mb-1">Diperoleh</p>
              <p className="text-lg font-bold text-green-300">
                +{summary.total_earned}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20 text-center">
              <p className="text-xs text-indigo-200 mb-1">Pengurangan</p>
              <p className="text-lg font-bold text-red-300">
                {summary.total_penalty}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20 text-center">
              <p className="text-xs text-indigo-200 mb-1">Digunakan</p>
              <p className="text-lg font-bold text-blue-300">
                {summary.total_spent}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Skeleton variant
export function HeroBalanceSectionSkeleton() {
  return (
    <div className="bg-gradient-to-br from-slate-300 to-slate-400 text-white rounded-3xl p-8 space-y-6 shadow-lg animate-pulse">
      <div className="h-4 bg-white/20 rounded w-32" />
      <div className="h-20 bg-white/20 rounded w-64" />
      <div className="space-y-3 bg-white/10 rounded-2xl p-4">
        <div className="h-8 bg-white/20 rounded w-40" />
        <div className="h-2 bg-white/20 rounded-full w-full" />
        <div className="h-3 bg-white/20 rounded w-48" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-white/20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
