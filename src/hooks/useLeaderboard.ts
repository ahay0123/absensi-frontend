// ═══════════════════════════════════════════════════════════════════════════
// HOOK: useLeaderboard
// Custom hook untuk manage leaderboard state dan data fetching
// ═══════════════════════════════════════════════════════════════════════════

"use client";

import { useState, useEffect } from "react";
import {
  getIntegrityLeaderboard,
  getAnalyticsSummary,
  AnalyticsSummary,
} from "@/services/adminAnalyticsService";
import { LeaderboardEntry } from "@/components/IntegrityLeaderboard";

export function useLeaderboard(initialMonth?: number, initialYear?: number) {
  // Ambil bulan sekarang (1-12)
  const [month, setMonth] = useState(initialMonth || new Date().getMonth() + 1);
  const [year, setYear] = useState(initialYear || new Date().getFullYear());

  const [topUsers, setTopUsers] = useState<LeaderboardEntry[]>([]);
  const [bottomUsers, setBottomUsers] = useState<LeaderboardEntry[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [period, setPeriod] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fungsi fetch sekarang murni menggunakan nilai dari state
  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Gunakan langsung dari state month dan year
      const [leaderboardData, summaryData] = await Promise.all([
        getIntegrityLeaderboard({
          month: month,
          year: year,
          limit: 10,
        }),
        getAnalyticsSummary(month, year),
      ]);

      setTopUsers(leaderboardData.top_users);
      setBottomUsers(leaderboardData.bottom_users);
      setSummary(summaryData);
      setPeriod(leaderboardData.period);
    } catch (err: any) {
      setError(err.message || "Gagal mengambil data leaderboard");
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch otomatis setiap kali month atau year berubah
  useEffect(() => {
    fetchLeaderboard();
  }, [month, year]);

  // Fungsi changeMonth sekarang hanya bertugas mengubah state
  const changeMonth = (newMonth: number, newYear: number) => {
    setMonth(newMonth);
    setYear(newYear);
  };

  return {
    topUsers,
    bottomUsers,
    summary,
    period,
    month,
    year,
    isLoading,
    error,
    changeMonth,
    refetch: fetchLeaderboard,
  };
}
