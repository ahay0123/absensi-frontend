// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT: IntegrityLeaderboard
// Tabel Analitik Integritas - Leaderboard siapa user dengan poin tertinggi/terendah
// ═══════════════════════════════════════════════════════════════════════════

import React from "react";
import { Trophy, TrendingDown, Loader2 } from "lucide-react";

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  name: string;
  nip?: string;
  total_points: number;
  change_from_previous?: number;
}

interface IntegrityLeaderboardProps {
  topUsers: LeaderboardEntry[];
  bottomUsers: LeaderboardEntry[];
  isLoading?: boolean;
  period?: string;
}

export default function IntegrityLeaderboard({
  topUsers,
  bottomUsers,
  isLoading = false,
  period = "Bulan Ini",
}: IntegrityLeaderboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200 p-6"
          >
            <div className="h-24 bg-slate-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  const getMedalIcon = (rank: number): string => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getTrendColor = (change?: number) => {
    if (!change) return "text-slate-500";
    if (change > 0) return "text-green-600";
    return "text-red-600";
  };

  const getTrendIcon = (change?: number) => {
    if (!change) return "→";
    if (change > 0) return "↑";
    return "↓";
  };

  return (
    <div className="space-y-8">
      {/* Top Users - Leaderboard Tertinggi */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <div>
            <h2 className="text-lg font-black text-slate-900">
              ⭐ Top Integritas
            </h2>
            <p className="text-xs text-slate-500">{period} - Poin Tertinggi</p>
          </div>
        </div>

        {topUsers.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500 text-sm">Data belum tersedia</p>
          </div>
        ) : (
          <div className="space-y-2">
            {topUsers.map((user, idx) => (
              <div
                key={user.user_id}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  idx === 0
                    ? "bg-yellow-50 border-yellow-300 shadow-lg scale-105"
                    : idx === 1
                      ? "bg-slate-100 border-slate-300"
                      : idx === 2
                        ? "bg-orange-50 border-orange-300"
                        : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Rank Badge */}
                <div className="text-4xl font-black min-w-fit">
                  {getMedalIcon(user.rank)}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">
                    {user.name}
                  </p>
                  {user.nip && (
                    <p className="text-xs text-slate-500">NIP: {user.nip}</p>
                  )}
                </div>

                {/* Points & Trend */}
                <div className="flex flex-col items-end gap-1">
                  <p className="text-2xl font-black text-slate-900">
                    {user.total_points.toLocaleString("id-ID")}
                  </p>
                  {user.change_from_previous !== undefined && (
                    <p
                      className={`text-xs font-semibold ${getTrendColor(user.change_from_previous)}`}
                    >
                      {getTrendIcon(user.change_from_previous)}
                      {user.change_from_previous > 0 ? "+" : ""}
                      {user.change_from_previous}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Users - Leaderboard Terendah */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <TrendingDown className="w-6 h-6 text-red-500" />
          <div>
            <h2 className="text-lg font-black text-slate-900">
              ⚠️ Perhatian Diperlukan
            </h2>
            <p className="text-xs text-slate-500">
              {period} - Poin Terendah (Membutuhkan Bimbingan)
            </p>
          </div>
        </div>

        {bottomUsers.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500 text-sm">Data belum tersedia</p>
          </div>
        ) : (
          <div className="space-y-2">
            {bottomUsers.map((user) => (
              <div
                key={user.user_id}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-red-200 bg-red-50 hover:border-red-300 transition-all"
              >
                {/* Rank Badge */}
                <div className="text-2xl font-black min-w-fit">⚠️</div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">
                    {user.name}
                  </p>
                  {user.nip && (
                    <p className="text-xs text-slate-500">NIP: {user.nip}</p>
                  )}
                </div>

                {/* Points Warning */}
                <div className="flex flex-col items-end gap-1">
                  <p className="text-2xl font-black text-red-600">
                    {user.total_points.toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs font-semibold text-red-600">
                    Perlu bantuan
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
        <p className="text-sm font-bold text-blue-900">ℹ️ Informasi</p>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>
            Leaderboard menampilkan ranking integritas berdasarkan total poin
          </li>
          <li>Top 3 pengguna menampilkan pencapaian luar biasa bulan ini</li>
          <li>
            Daftar "Perhatian" menunjukkan pengguna yang membutuhkan bimbingan
          </li>
          <li>
            Pertimbangkan memberikan support atau incentive untuk peningkatan
          </li>
        </ul>
      </div>
    </div>
  );
}

// Skeleton variant
export function IntegrityLeaderboardSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-6 bg-slate-200 rounded w-32 animate-pulse" />
          {[1, 2, 3].map((j) => (
            <div
              key={j}
              className="h-16 bg-slate-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
