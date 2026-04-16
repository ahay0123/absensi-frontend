// ═══════════════════════════════════════════════════════════════════════════
// SERVICE: Admin Analytics / Leaderboard
// API calls untuk mendapatkan leaderboard dan analytics data
// ═══════════════════════════════════════════════════════════════════════════

import axios from "@/lib/axios";
import { LeaderboardEntry } from "@/components/IntegrityLeaderboard";

export interface GetLeaderboardParams {
  month?: number;
  year?: number;
  limit?: number;
}

export interface LeaderboardResponse {
  top_users: LeaderboardEntry[];
  bottom_users: LeaderboardEntry[];
  period: string;
  generated_at: string;
}

/**
 * Get integrity leaderboard (top dan bottom users)
 * GET /api/admin/analytics/leaderboard
 */
export async function getIntegrityLeaderboard(
  params?: GetLeaderboardParams,
): Promise<LeaderboardResponse> {
  try {
    const response = await axios.get<LeaderboardResponse>(
      "/admin/analytics/leaderboard",
      {
        params: {
          month: params?.month || new Date().getMonth() + 1,
          year: params?.year || new Date().getFullYear(),
          limit: params?.limit || 10,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Gagal mengambil data leaderboard",
    );
  }
}

export interface AnalyticsSummary {
  total_users: number;
  total_points_distributed: number;
  average_points_per_user: number;
  top_performer: {
    name: string;
    total_points: number;
  };
  most_improved: {
    name: string;
    points_gained: number;
  };
}

/**
 * Get monthly analytics summary
 * GET /api/admin/analytics/summary
 */
export async function getAnalyticsSummary(month?: number, year?: number) {
  try {
    const response = await axios.get<AnalyticsSummary>(
      "/admin/analytics/summary",
      {
        params: {
          month: month || new Date().getMonth() + 1,
          year: year || new Date().getFullYear(),
        },
      },
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Gagal mengambil data analytics",
    );
  }
}

export interface PointTrendData {
  date: string;
  total_points_earned: number;
  total_points_spent: number;
  total_points_penalty: number;
}

/**
 * Get point trend data (for charts)
 * GET /api/admin/analytics/trend
 */
export async function getPointTrend(
  month?: number,
  year?: number,
): Promise<PointTrendData[]> {
  try {
    const response = await axios.get<PointTrendData[]>(
      "/admin/analytics/trend",
      {
        params: {
          month: month || new Date().getMonth() + 1,
          year: year || new Date().getFullYear(),
        },
      },
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Gagal mengambil data trend",
    );
  }
}

/**
 * Get user detail analytics (progression over time)
 * GET /api/admin/analytics/user/:userId
 */
export async function getUserAnalytics(
  userId: number,
  month?: number,
  year?: number,
) {
  try {
    const response = await axios.get(`/admin/analytics/user/${userId}`, {
      params: {
        month: month || new Date().getMonth() + 1,
        year: year || new Date().getFullYear(),
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Gagal mengambil data user",
    );
  }
}

/**
 * Export leaderboard as CSV
 * GET /api/admin/analytics/leaderboard/export
 */
export async function exportLeaderboard(month?: number, year?: number) {
  try {
    const response = await axios.get("/admin/analytics/leaderboard/export", {
      params: {
        month: month || new Date().getMonth() + 1,
        year: year || new Date().getFullYear(),
      },
      responseType: "blob",
    });

    // Create blob and download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `leaderboard-${month}-${year}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentElement?.removeChild(link);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Gagal mengexport leaderboard",
    );
  }
}
