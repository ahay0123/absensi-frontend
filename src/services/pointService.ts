// ═══════════════════════════════════════════════════════════════════════════
// POINT SERVICE - API calls untuk Integrity Wallet
// ═══════════════════════════════════════════════════════════════════════════

import api from "@/lib/axios";
import {
  PointBalance,
  PointHistory,
  PointSummary,
  PointTransaction,
} from "@/types/point";

const BASE_URL = "/integrity-wallet";

/**
 * Get current point balance
 * GET /api/integrity-wallet/balance
 */
export const getBalance = async (): Promise<PointBalance> => {
  const { data } = await api.get<{ data: PointBalance }>(`${BASE_URL}/balance`);
  return data.data;
};

/**
 * Get point transaction history (paginated)
 * GET /api/integrity-wallet/history?page=1&limit=50
 */
export const getHistory = async (
  page: number = 1,
  limit: number = 20,
): Promise<PointHistory> => {
  const { data } = await api.get<PointHistory>(`${BASE_URL}/history`, {
    params: { page, limit },
  });
  return data;
};

/**
 * Get point summary/statistics
 * GET /api/integrity-wallet/summary
 */
export const getSummary = async (): Promise<PointSummary> => {
  const { data } = await api.get<{ data: PointSummary }>(`${BASE_URL}/summary`);
  return data.data;
};

/**
 * Helper: Format transaction type untuk display
 */
export const formatTransactionType = (type: string): string => {
  const typeMap: Record<string, string> = {
    EARN: "Diperoleh",
    PENALTY: "Pengurangan",
    SPEND: "Digunakan",
    REWARD: "Bonus",
  };
  return typeMap[type] || type;
};

/**
 * Helper: Get color class untuk transaction type
 */
export const getTransactionColor = (
  type: string,
): {
  bg: string;
  text: string;
  icon: string;
} => {
  const colors: Record<string, { bg: string; text: string; icon: string }> = {
    EARN: { bg: "bg-green-50", text: "text-green-600", icon: "📈" },
    PENALTY: { bg: "bg-red-50", text: "text-red-600", icon: "📉" },
    SPEND: { bg: "bg-blue-50", text: "text-blue-600", icon: "💳" },
    REWARD: { bg: "bg-yellow-50", text: "text-yellow-600", icon: "🎁" },
  };
  return (
    colors[type] || { bg: "bg-slate-50", text: "text-slate-600", icon: "•" }
  );
};

/**
 * Helper: Format date untuk display
 */
export const formatTransactionDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();

  // Jika hari yang sama
  if (date.toDateString() === now.toDateString()) {
    return `Hari ini, ${date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // Jika kemarin
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Kemarin, ${date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // Format standar
  return date.toLocaleDateString("id-ID", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
