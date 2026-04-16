// ═══════════════════════════════════════════════════════════════════════════
// FLEXIBILITY MARKETPLACE PAGE
// Browse and redeem tokens with points
// ═══════════════════════════════════════════════════════════════════════════

"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Alert, { useAlert } from "@/components/Alert";
import BottomNav from "@/components/BottomNav";
import MarketplaceItemCard, {
  MarketplaceItemSkeleton,
} from "@/components/MarketplaceItemCard";
import { useMarketplace } from "@/hooks/useMarketplace";
import { PointBalance } from "@/types/point";
import { getBalance } from "@/services/pointService";
import { useEffect, useState } from "react";

export default function MarketplacePage() {
  const router = useRouter();
  const { alert, showAlert, hideAlert } = useAlert();
  const {
    items,
    userBalance,
    isLoading,
    isRedeeming,
    error,
    redeemError,
    redeem,
    canRedeem,
    refetch,
  } = useMarketplace();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [redeemingId, setRedeemingId] = useState<number | null>(null);

  const handleRedeem = async (itemId: number) => {
    setRedeemingId(itemId);
    try {
      await redeem(itemId);
      showAlert(
        "success",
        "Token berhasil ditukar! Cek di halaman 'Token Ku' untuk melihat token Anda.",
      );
    } catch (err) {
      // Error sudah di set di hook
    } finally {
      setRedeemingId(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      showAlert("success", "Data berhasil diperbarui");
    } catch (err) {
      showAlert("error", "Gagal memperbarui data");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Alert */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          duration={4000}
          onClose={hideAlert}
        />
      )}

      {redeemError && (
        <Alert
          type="error"
          message={redeemError}
          duration={3000}
          onClose={() => {}}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-slate-100 z-40">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-800">
              Pasar Fleksibilitas
            </h1>
            <p className="text-xs text-slate-500">
              Tukarkan poin Anda dengan token
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-5 h-5 text-slate-600 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Balance Bar */}
        <div className="px-4 py-3 border-t border-slate-100 bg-indigo-50">
          <p className="text-xs text-slate-600 mb-1">Saldo Poin Anda</p>
          <p className="text-2xl font-bold text-indigo-600">
            {userBalance.toLocaleString("id-ID")}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 space-y-4">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && items.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-100 p-8 text-center space-y-3">
            <p className="text-3xl">🛍️</p>
            <p className="text-slate-500 text-sm">
              Belum ada item yang tersedia di marketplace
            </p>
          </div>
        )}

        {/* Items Grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <MarketplaceItemCard
                key={item.id}
                item={item}
                isRedeeming={redeemingId === item.id && isRedeeming}
                onRedeem={() => handleRedeem(item.id)}
                userBalance={userBalance}
              />
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <MarketplaceItemSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <p className="font-semibold text-sm text-blue-900">💡 Tips</p>
          <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
            <li>Kumpulkan poin dengan kehadiran tepat waktu</li>
            <li>Tukarkan poin Anda dengan token privileges favorit</li>
            <li>Gunakan token saat Anda membutuhkan fleksibilitas</li>
          </ul>
        </div>
      </main>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
