// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM HOOK: useMarketplace
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import {
  getMarketplaceItems,
  redeemItem,
  getMyTokens,
  canAffordItem,
  isItemInStock,
} from "@/services/marketplaceService";
import {
  FlexibilityItem,
  MarketplaceResponse,
  MyTokensResponse,
  UserToken,
} from "@/types/point";

interface UseMarketplaceReturn {
  items: FlexibilityItem[];
  userBalance: number;
  myTokens: MyTokensResponse | null;
  isLoading: boolean;
  isRedeeming: boolean;
  error: string | null;
  redeemError: string | null;
  fetchItems: () => Promise<void>;
  fetchMyTokens: () => Promise<void>;
  redeem: (itemId: number) => Promise<void>;
  canRedeem: (itemId: number) => boolean;
  refetch: () => Promise<void>;
}

export const useMarketplace = (): UseMarketplaceReturn => {
  const [items, setItems] = useState<FlexibilityItem[]>([]);
  const [userBalance, setUserBalance] = useState(0);
  const [myTokens, setMyTokens] = useState<MyTokensResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await getMarketplaceItems();
      setItems(data.items);
      setUserBalance(data.user_balance);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal memuat item marketplace");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyTokens = async () => {
    try {
      setError(null);
      const data = await getMyTokens();
      setMyTokens(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal memuat token Anda");
    }
  };

  const redeem = async (itemId: number) => {
    try {
      setRedeemError(null);
      setIsRedeeming(true);

      // Validation
      const item = items.find((i) => i.id === itemId);
      if (!item) {
        setRedeemError("Item tidak ditemukan");
        return;
      }

      if (!isItemInStock(item)) {
        setRedeemError("Item habis");
        return;
      }

      if (!canAffordItem(userBalance, item.point_cost)) {
        setRedeemError(
          `Saldo poin tidak cukup. Butuh: ${item.point_cost}, Tersedia: ${userBalance}`,
        );
        return;
      }

      // Redeem
      await redeemItem(itemId);

      // Refetch data
      await Promise.all([fetchItems(), fetchMyTokens()]);
    } catch (err: any) {
      setRedeemError(err?.response?.data?.message || "Gagal melakukan redeem");
    } finally {
      setIsRedeeming(false);
    }
  };

  const canRedeem = (itemId: number): boolean => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return false;

    return isItemInStock(item) && canAffordItem(userBalance, item.point_cost);
  };

  const refetch = async () => {
    await Promise.all([fetchItems(), fetchMyTokens()]);
  };

  // Initial fetch
  useEffect(() => {
    refetch();
  }, []);

  return {
    items,
    userBalance,
    myTokens,
    isLoading,
    isRedeeming,
    error,
    redeemError,
    fetchItems,
    fetchMyTokens,
    redeem,
    canRedeem,
    refetch,
  };
};
