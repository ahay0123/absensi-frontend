// ═══════════════════════════════════════════════════════════════════════════
// HOOK: useLeaderboard
// Custom hook untuk manage leaderboard state dan data fetching
// ═══════════════════════════════════════════════════════════════════════════

"use client";

import { useState, useEffect } from "react";
import {
  getIntegrityLeaderboard,
  getAnalyticsSummary,
  LeaderboardResponse,
  AnalyticsSummary,
} from "@/services/adminAnalyticsService";
import { LeaderboardEntry } from "@/components/IntegrityLeaderboard";

export function useLeaderboard(initialMonth?: number, initialYear?: number) {
  const [month, setMonth] = useState(initialMonth || new Date().getMonth() + 1);
  const [year, setYear] = useState(initialYear || new Date().getFullYear());

  const [topUsers, setTopUsers] = useState<LeaderboardEntry[]>([]);
  const [bottomUsers, setBottomUsers] = useState<LeaderboardEntry[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [period, setPeriod] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async (m?: number, y?: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const targetMonth = m || month;
      const targetYear = y || year;

      const [leaderboardData, summaryData] = await Promise.all([
        getIntegrityLeaderboard({
          month: targetMonth,
          year: targetYear,
          limit: 10,
        }),
        getAnalyticsSummary(targetMonth, targetYear),
      ]);

      setTopUsers(leaderboardData.top_users);
      setBottomUsers(leaderboardData.bottom_users);
      setSummary(summaryData);
      setPeriod(leaderboardData.period);

      if (m || y) {
        setMonth(targetMonth);
        setYear(targetYear);
      }
    } catch (err: any) {
      setError(err.message || "Gagal mengambil data leaderboard");
      console.error("Leaderboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const changeMonth = (newMonth: number, newYear: number) => {
    fetchLeaderboard(newMonth, newYear);
  };

  return {
    // Data
    topUsers,
    bottomUsers,
    summary,
    period,

    // State
    month,
    year,
    isLoading,
    error,

    // Actions
    fetchLeaderboard,
    changeMonth,
    refetch: () => fetchLeaderboard(month, year),
  };
}
