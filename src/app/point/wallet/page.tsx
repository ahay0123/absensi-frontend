// ═══════════════════════════════════════════════════════════════════════════
// GURU WALLET PAGE - REDESIGNED
// E-Wallet style dengan Hero section + Tabbed layout (Riwayat, Marketplace, Inventory)
// ═══════════════════════════════════════════════════════════════════════════

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, ChevronRight } from "lucide-react";
import api from "@/lib/axios";
import Alert, { useAlert } from "@/components/Alert";
import BottomNav from "@/components/BottomNav";
import HeroBalanceSection, {
  HeroBalanceSectionSkeleton,
} from "@/components/HeroBalanceSection";
import WalletTabs, { WalletTabType } from "@/components/WalletTabs";
import PointTransactionItem, {
  PointTransactionSkeleton,
} from "@/components/PointTransactionItem";
import MarketplaceItemCard, {
  MarketplaceItemSkeleton,
} from "@/components/MarketplaceItemCard";
import TokenCard, { TokenCardSkeleton } from "@/components/TokenCard";
import { usePoint } from "@/hooks/usePoint";
import { useMarketplace } from "@/hooks/useMarketplace";

export default function PointWalletPage() {
  const router = useRouter();
  const { alert, showAlert, hideAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<WalletTabType>("history");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Point hook for balance & history
  const {
    balance,
    history,
    summary,
    totalHistory,
    currentPage,
    isLoading: historyLoading,
    error: historyError,
    fetchHistory,
    refetch: refetchPoint,
  } = usePoint();

  // Marketplace hook for items & tokens
  const {
    items,
    userBalance,
    myTokens,
    isLoading: marketplaceLoading,
    isRedeeming,
    redeemError,
    redeem,
    canRedeem,
    refetch: refetchMarketplace,
  } = useMarketplace();

  const [redeemingId, setRedeemingId] = useState<number | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchPoint(), refetchMarketplace()]);
      showAlert("success", "Dompet diperbarui ✨");
    } catch (err) {
      showAlert("error", "Gagal memperbarui dompet");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRedeem = async (itemId: number) => {
    setRedeemingId(itemId);
    try {
      await redeem(itemId);
      showAlert("success", "Token berhasil ditukar! 🎉");
      setActiveTab("inventory"); // Switch ke inventory view
    } catch (err) {
      // Error already handled in hook
    } finally {
      setRedeemingId(null);
    }
  };

  const hasMorePages = currentPage < Math.ceil(totalHistory / 20);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 pb-24">
      {/* Alert */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          duration={3000}
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
      <header className="sticky top-0 bg-white border-b border-slate-200 z-40 backdrop-blur-sm bg-opacity-95">
        <div className="flex items-center justify-between p-4 max-w-2xl mx-auto w-full">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-lg font-bold text-slate-800 flex-1 text-center">
            Dompet Integritas
          </h1>
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
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Hero Balance Section */}
        {historyLoading && summary === null ? (
          <HeroBalanceSectionSkeleton />
        ) : (
          <HeroBalanceSection
            balance={balance}
            summary={summary}
            isLoading={false}
          />
        )}

        {/* Wallet Tabs */}
        <WalletTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          inventoryBadge={myTokens?.summary.available_count || 0}
        >
          {/* TAB 1: RIWAYAT MUTASI */}
          {activeTab === "history" && (
            <div className="space-y-3">
              {/* Error State */}
              {historyError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
                  {historyError}
                </div>
              )}

              {/* Empty State */}
              {!historyLoading && history.length === 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
                  <p className="text-3xl">📋</p>
                  <p className="text-slate-600 text-sm font-medium">
                    Belum ada transaksi
                  </p>
                  <p className="text-slate-400 text-xs">
                    Mulai dapatkan poin dengan kehadiran tepat waktu
                  </p>
                </div>
              )}

              {/* History List */}
              {history.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {history.map((transaction) => (
                    <PointTransactionItem
                      key={transaction.id}
                      transaction={transaction}
                    />
                  ))}
                </div>
              )}

              {/* Loading State */}
              {historyLoading && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {[1, 2, 3].map((i) => (
                    <PointTransactionSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {hasMorePages && !historyLoading && (
                <button
                  onClick={() => fetchHistory(currentPage + 1)}
                  className="w-full py-3 border-2 border-indigo-300 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors active:scale-95 flex items-center justify-center gap-2"
                >
                  <ChevronRight className="w-4 h-4" />
                  Muat Lebih Banyak
                </button>
              )}
            </div>
          )}

          {/* TAB 2: MARKETPLACE */}
          {activeTab === "marketplace" && (
            <div className="space-y-4">
              {/* Error State */}
              {!marketplaceLoading && items.length === 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
                  <p className="text-3xl">🏪</p>
                  <p className="text-slate-600 text-sm font-medium">
                    Marketplace kosong
                  </p>
                  <p className="text-slate-400 text-xs">
                    Tunggu admin menambahkan item baru
                  </p>
                </div>
              )}

              {/* Items Grid */}
              {items.length > 0 && (
                <>
                  {/* User Balance Info */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 p-4">
                    <p className="text-xs text-slate-600 mb-1">Saldo Anda</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {userBalance.toLocaleString("id-ID")} poin
                    </p>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </>
              )}

              {/* Loading State */}
              {marketplaceLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <MarketplaceItemSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Tip */}
              {items.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-2">
                  <p className="font-semibold text-sm text-yellow-900">
                    💡 Tips
                  </p>
                  <ul className="text-xs text-yellow-800 space-y-1 ml-4 list-disc">
                    <li>Kumpulkan poin lewat kehadiran tepat waktu</li>
                    <li>Tukarkan poin dengan token privilege favorit</li>
                    <li>Gunakan token saat Anda butuh fleksibilitas</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INVENTORY (My Tokens) */}
          {activeTab === "inventory" && (
            <div className="space-y-4">
              {/* Summary Cards */}
              {myTokens && !marketplaceLoading && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {myTokens.summary.available_count}
                    </p>
                    <p className="text-xs text-green-700 font-medium mt-2">
                      Tersedia
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-center">
                    <p className="text-3xl font-bold text-slate-600">
                      {myTokens.summary.used_count}
                    </p>
                    <p className="text-xs text-slate-700 font-medium mt-2">
                      Dipakai
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
                    <p className="text-3xl font-bold text-red-600">
                      {myTokens.summary.expired_count}
                    </p>
                    <p className="text-xs text-red-700 font-medium mt-2">
                      Kadaluarsa
                    </p>
                  </div>
                </div>
              )}

              {/* Available Tokens */}
              {myTokens && myTokens.available.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-800">
                    ✅ Token Siap Dipakai
                  </h3>
                  <div className="space-y-2">
                    {myTokens.available.map((token) => (
                      <TokenCard key={token.id} token={token} />
                    ))}
                  </div>
                </div>
              )}

              {/* Used Tokens */}
              {myTokens && myTokens.used.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-800">
                    ⏱️ Sudah Digunakan
                  </h3>
                  <div className="space-y-2">
                    {myTokens.used.map((token) => (
                      <TokenCard key={token.id} token={token} />
                    ))}
                  </div>
                </div>
              )}

              {/* Expired Tokens */}
              {myTokens && myTokens.expired.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-800">⛔ Kadaluarsa</h3>
                  <div className="space-y-2">
                    {myTokens.expired.map((token) => (
                      <TokenCard key={token.id} token={token} />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!marketplaceLoading &&
                myTokens &&
                myTokens.summary.available_count === 0 &&
                myTokens.summary.used_count === 0 &&
                myTokens.summary.expired_count === 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
                    <p className="text-3xl">📦</p>
                    <p className="text-slate-600 text-sm font-medium">
                      Inventory Kosong
                    </p>
                    <p className="text-slate-400 text-xs">
                      Tukarkan poin Anda dengan token di marketplace
                    </p>
                  </div>
                )}

              {/* Loading State */}
              {marketplaceLoading && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-20 bg-slate-100 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                  {[1, 2].map((i) => (
                    <TokenCardSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                <p className="font-semibold text-sm text-blue-900">
                  ℹ️ Informasi Token
                </p>
                <p className="text-xs text-blue-800">
                  Token siap dipakai akan otomatis digunakan saat Anda
                  memerlukan fleksibilitas (misalnya untuk mengurus
                  keterlambatan).
                </p>
              </div>
            </div>
          )}
        </WalletTabs>
      </main>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
