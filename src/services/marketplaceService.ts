// ═══════════════════════════════════════════════════════════════════════════
// MARKETPLACE SERVICE - API calls untuk Flexibility Marketplace
// ═══════════════════════════════════════════════════════════════════════════

import api from "@/lib/axios";
import {
  FlexibilityItem,
  MarketplaceResponse,
  MyTokensResponse,
  RedeemResponse,
  UserToken,
} from "@/types/point";

const BASE_URL = "/marketplace";

/**
 * Get available marketplace items
 * GET /api/marketplace/items
 */
export const getMarketplaceItems = async (): Promise<MarketplaceResponse> => {
  const { data } = await api.get<MarketplaceResponse>(`${BASE_URL}/items`);
  return data;
};

/**
 * Redeem item with points
 * POST /api/marketplace/redeem/{itemId}
 */
export const redeemItem = async (itemId: number): Promise<RedeemResponse> => {
  const { data } = await api.post<RedeemResponse>(
    `${BASE_URL}/redeem/${itemId}`,
  );
  return data;
};

/**
 * Get user's tokens
 * GET /api/marketplace/my-tokens
 */
export const getMyTokens = async (): Promise<MyTokensResponse> => {
  const { data } = await api.get<MyTokensResponse>(`${BASE_URL}/my-tokens`);
  return data;
};

/**
 * Helper: Get status badge color
 */
export const getTokenStatusColor = (
  status: string,
): {
  bg: string;
  text: string;
  label: string;
} => {
  const statusMap: Record<string, { bg: string; text: string; label: string }> =
    {
      AVAILABLE: {
        bg: "bg-green-50",
        text: "text-green-600",
        label: "Tersedia",
      },
      USED: { bg: "bg-slate-50", text: "text-slate-600", label: "Digunakan" },
      EXPIRED: {
        bg: "bg-red-50",
        text: "text-red-600",
        label: "Kadaluarsa",
      },
    };
  return statusMap[status] || statusMap["AVAILABLE"];
};

/**
 * Helper: Check if user can afford item
 */
export const canAffordItem = (
  userBalance: number,
  itemCost: number,
): boolean => {
  return userBalance >= itemCost;
};

/**
 * Helper: Check if item is in stock
 */
export const isItemInStock = (item: FlexibilityItem): boolean => {
  return item.in_stock;
};

/**
 * Helper: Format point cost untuk display
 */
export const formatPointCost = (cost: number): string => {
  return cost.toLocaleString("id-ID");
};

/**
 * Helper: Get affordability status
 */
export const getAffordabilityStatus = (
  userBalance: number,
  itemCost: number,
): "affordable" | "insufficient" => {
  return userBalance >= itemCost ? "affordable" : "insufficient";
};
