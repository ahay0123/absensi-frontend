// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT: MarketplaceItem (Redesigned)
// Item card dengan gambar ilustrasi, grid-friendly untuk marketplace
// ═══════════════════════════════════════════════════════════════════════════

import React from "react";
import { Loader2, AlertCircle, Check, Heart } from "lucide-react";
import { FlexibilityItem } from "@/types/point";

interface MarketplaceItemProps {
  item: FlexibilityItem;
  isRedeeming?: boolean;
  onRedeem?: () => void;
  userBalance?: number;
}

export default function MarketplaceItemCard({
  item,
  isRedeeming = false,
  onRedeem,
  userBalance = 0,
}: MarketplaceItemProps) {
  const isAffordable = userBalance >= item.point_cost;
  const isInStock = item.in_stock;
  const canRedeem = isAffordable && isInStock;

  // Placeholder illustration (bisa diganti dengan real image nanti)
  const getPlaceholderIcon = (index: number) => {
    const icons = ["🎟️", "🏆", "📋", "🎫", "💳", "🎁"];
    return icons[index % icons.length];
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
      {/* Image Section */}
      <div
        className={`aspect-video w-full flex items-center justify-center text-5xl font-bold relative overflow-hidden ${
          isInStock
            ? "bg-gradient-to-br from-indigo-100 to-blue-100"
            : "bg-slate-100"
        }`}
      >
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-400 rounded-full -mr-12 -mt-12" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400 rounded-full -ml-16 -mb-16" />
        </div>

        {/* Icon/Illustration */}
        <div className="relative z-10">{getPlaceholderIcon(item.id)}</div>

        {/* Stock Badge */}
        <div className="absolute top-3 right-3 z-10">
          {!isInStock ? (
            <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Habis
            </span>
          ) : isAffordable ? (
            <span className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Ready
            </span>
          ) : (
            <span className="inline-block bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Limited
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div>
          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
            {item.item_name}
          </h3>
        </div>

        {/* Price in Poin */}
        <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
          <p className="text-xs text-slate-600 mb-1">Harga Poin</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <p className="text-2xl font-black text-indigo-600">
              {item.point_cost.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Stock Info */}
        {item.stock_limit && (
          <p className="text-xs text-slate-500 text-center">
            Stok terbatas: {item.stock_limit} unit
          </p>
        )}

        {/* Affordability Status */}
        {!isAffordable && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs">
              Saldo kurang {item.point_cost - userBalance}
            </span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onRedeem}
          disabled={!canRedeem || isRedeeming}
          className={`w-full py-3 px-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            !canRedeem || isRedeeming
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
          }`}
        >
          {isRedeeming ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Memproses...
            </>
          ) : !isInStock ? (
            <>
              <AlertCircle className="w-4 h-4" />
              Stok Habis
            </>
          ) : !isAffordable ? (
            <>
              <AlertCircle className="w-4 h-4" />
              Saldo Kurang
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Tukar Sekarang
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Skeleton component untuk loading state
export function MarketplaceItemSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 space-y-2">
        <div className="h-4 bg-slate-100 rounded w-32 animate-pulse" />
        <div className="h-3 bg-slate-100 rounded w-24 animate-pulse" />
      </div>
      <div className="p-4 space-y-3">
        <div className="bg-slate-100 rounded-lg h-16 animate-pulse" />
        <div className="h-10 bg-slate-100 rounded animate-pulse" />
      </div>
    </div>
  );
}
