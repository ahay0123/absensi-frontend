// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT: PointTransaction
// Single transaction item untuk history
// ═══════════════════════════════════════════════════════════════════════════

import React from "react";
import { PointTransaction } from "@/types/point";
import {
  formatTransactionType,
  getTransactionColor,
  formatTransactionDate,
} from "@/services/pointService";
import { Plus, Minus } from "lucide-react";

interface PointTransactionProps {
  transaction: PointTransaction;
}

export default function PointTransactionItem({
  transaction,
}: PointTransactionProps) {
  const color = getTransactionColor(transaction.transaction_type);
  const formattedType = formatTransactionType(transaction.transaction_type);
  const formattedDate = formatTransactionDate(transaction.created_at);
  const isPositive = transaction.amount > 0;

  return (
    <div className="flex items-start gap-4 p-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
      {/* Left: Large Icon Badge */}
      <div
        className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold ${color.bg} border-2 ${
          color.bg.includes("green")
            ? "border-green-300"
            : color.bg.includes("red")
              ? "border-red-300"
              : "border-blue-300"
        }`}
      >
        {isPositive ? (
          <Plus className="w-7 h-7 text-green-600" />
        ) : (
          <Minus className="w-7 h-7 text-red-600" />
        )}
      </div>

      {/* Middle: Description & Metadata */}
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm ${color.text} truncate`}>
          {formattedType}
        </p>
        <p className="text-sm text-slate-600 mt-1">{transaction.description}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
          <span>{formattedDate}</span>
          {transaction.related_attendance_id && (
            <span>Absensi #{transaction.related_attendance_id}</span>
          )}
        </div>
      </div>

      {/* Right: Amount & Balance */}
      <div className="flex flex-col items-end flex-shrink-0">
        <p
          className={`text-xl font-black ${isPositive ? "text-green-600" : "text-red-600"}`}
        >
          {isPositive ? "+" : ""}
          {transaction.amount}
        </p>
        <p className="text-xs text-slate-500 mt-2 text-right">
          Saldo:
          <br />
          <span className="font-semibold text-slate-700">
            {transaction.current_balance}
          </span>
        </p>
      </div>
    </div>
  );
}

// Skeleton component untuk loading state
export function PointTransactionSkeleton() {
  return (
    <div className="p-4 border-b border-slate-100 space-y-2">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-slate-100 rounded-lg animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-100 rounded w-24 animate-pulse" />
          <div className="h-3 bg-slate-100 rounded w-full animate-pulse" />
          <div className="h-3 bg-slate-100 rounded w-32 animate-pulse" />
        </div>
        <div className="flex-shrink-0 space-y-2 text-right">
          <div className="h-4 bg-slate-100 rounded w-16 animate-pulse" />
          <div className="h-3 bg-slate-100 rounded w-20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
