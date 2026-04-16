// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM HOOK: usePoint
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import {
  getBalance,
  getHistory,
  getSummary,
  formatTransactionType,
  getTransactionColor,
  formatTransactionDate,
} from "@/services/pointService";
import {
  PointBalance,
  PointHistory,
  PointSummary,
  PointTransaction,
} from "@/types/point";

interface UsePointReturn {
  balance: PointBalance | null;
  history: PointTransaction[];
  summary: PointSummary | null;
  totalHistory: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  fetchBalance: () => Promise<void>;
  fetchHistory: (page: number) => Promise<void>;
  fetchSummary: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const usePoint = (): UsePointReturn => {
  const [balance, setBalance] = useState<PointBalance | null>(null);
  const [history, setHistory] = useState<PointTransaction[]>([]);
  const [summary, setSummary] = useState<PointSummary | null>(null);
  const [totalHistory, setTotalHistory] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    try {
      setError(null);
      const data = await getBalance();
      setBalance(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal memuat saldo poin");
    }
  };

  const fetchHistory = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getHistory(page, 20);
      setHistory(data.data);
      setTotalHistory(data.pagination.total);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal memuat riwayat poin");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      setError(null);
      const data = await getSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal memuat ringkasan poin");
    }
  };

  const refetch = async () => {
    await Promise.all([fetchBalance(), fetchHistory(1), fetchSummary()]);
  };

  // Initial fetch
  useEffect(() => {
    refetch();
  }, []);

  return {
    balance,
    history,
    summary,
    totalHistory,
    currentPage,
    isLoading,
    error,
    fetchBalance,
    fetchHistory,
    fetchSummary,
    refetch,
  };
};

// Helper: Transform transaction untuk display
export const transformTransaction = (transaction: PointTransaction) => {
  return {
    ...transaction,
    formattedType: formatTransactionType(transaction.transaction_type),
    colorClass: getTransactionColor(transaction.transaction_type),
    formattedDate: formatTransactionDate(transaction.created_at),
    isNegative: transaction.amount < 0,
    displayAmount: `${transaction.amount > 0 ? "+" : ""}${transaction.amount}`,
  };
};
