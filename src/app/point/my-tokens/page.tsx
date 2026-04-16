// ═══════════════════════════════════════════════════════════════════════════
// MY TOKENS PAGE
// View and manage user's tokens (available, used, expired)
// ═══════════════════════════════════════════════════════════════════════════

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Alert, { useAlert } from "@/components/Alert";
import BottomNav from "@/components/BottomNav";
import TokenCard, { TokenCardSkeleton } from "@/components/TokenCard";
import { useMarketplace } from "@/hooks/useMarketplace";

export default function MyTokensPage() {
  const router = useRouter();
  const { alert, showAlert, hideAlert } = useAlert();
  const { myTokens, isLoading, error, fetchMyTokens } = useMarketplace();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchMyTokens();
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
          duration={3000}
          onClose={hideAlert}
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
          <h1 className="text-lg font-bold text-slate-800 flex-1">
            Token Saya
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
      <main className="p-4 space-y-6">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        {myTokens && !isLoading && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 rounded-lg border border-green-200 p-3 text-center">
              <p className="text-2xl font-bold text-green-600">
                {myTokens.summary.available_count}
              </p>
              <p className="text-xs text-green-700 font-medium mt-1">
                Tersedia
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 text-center">
              <p className="text-2xl font-bold text-slate-600">
                {myTokens.summary.used_count}
              </p>
              <p className="text-xs text-slate-700 font-medium mt-1">
                Digunakan
              </p>
            </div>
            <div className="bg-red-50 rounded-lg border border-red-200 p-3 text-center">
              <p className="text-2xl font-bold text-red-600">
                {myTokens.summary.expired_count}
              </p>
              <p className="text-xs text-red-700 font-medium mt-1">
                Kadaluarsa
              </p>
            </div>
          </div>
        )}

        {/* Tab Section - Available Tokens */}
        <div className="space-y-3">
          <h2 className="font-bold text-slate-800 text-lg">
            ✅ Token Tersedia
          </h2>

          {isLoading && (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <TokenCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!isLoading && myTokens?.available.length === 0 && (
            <div className="bg-white rounded-lg border border-slate-100 p-6 text-center">
              <p className="text-slate-500 text-sm">
                Anda belum memiliki token yang tersedia
              </p>
              <p className="text-slate-400 text-xs mt-2">
                Kunjungi marketplace untuk menukar poin dengan token
              </p>
            </div>
          )}

          {!isLoading &&
            myTokens?.available &&
            myTokens.available.length > 0 && (
              <div className="space-y-2">
                {myTokens.available.map((token) => (
                  <TokenCard key={token.id} token={token} section="available" />
                ))}
              </div>
            )}
        </div>

        {/* Tab Section - Used Tokens */}
        {myTokens && (myTokens.used.length > 0 || !isLoading) && (
          <div className="space-y-3">
            <h2 className="font-bold text-slate-800 text-lg">
              ⏱️ Token Digunakan ({myTokens?.summary.used_count || 0})
            </h2>

            {isLoading && (
              <div className="space-y-2">
                {[1].map((i) => (
                  <TokenCardSkeleton key={i} />
                ))}
              </div>
            )}

            {!isLoading && myTokens.used.length === 0 && (
              <div className="bg-white rounded-lg border border-slate-100 p-6 text-center">
                <p className="text-slate-500 text-sm">
                  Anda belum menggunakan token apapun
                </p>
              </div>
            )}

            {!isLoading && myTokens.used.length > 0 && (
              <div className="space-y-2">
                {myTokens.used.map((token) => (
                  <TokenCard key={token.id} token={token} section="used" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Section - Expired Tokens */}
        {myTokens && (myTokens.expired.length > 0 || !isLoading) && (
          <div className="space-y-3">
            <h2 className="font-bold text-slate-800 text-lg">
              ⛔ Token Kadaluarsa ({myTokens?.summary.expired_count || 0})
            </h2>

            {isLoading && (
              <div className="space-y-2">
                {[1].map((i) => (
                  <TokenCardSkeleton key={i} />
                ))}
              </div>
            )}

            {!isLoading && myTokens.expired.length === 0 && (
              <div className="bg-white rounded-lg border border-slate-100 p-6 text-center">
                <p className="text-slate-500 text-sm">
                  Belum ada token yang kadaluarsa
                </p>
              </div>
            )}

            {!isLoading && myTokens.expired.length > 0 && (
              <div className="space-y-2">
                {myTokens.expired.map((token) => (
                  <TokenCard key={token.id} token={token} section="expired" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
          <p className="font-semibold text-sm text-yellow-900">ℹ️ Informasi</p>
          <p className="text-xs text-yellow-800">
            Token yang tersedia dapat digunakan kapan saja saat Anda membutuhkan
            fleksibilitas. Pastikan menggunakan token sebelum kadaluarsa.
          </p>
        </div>
      </main>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
