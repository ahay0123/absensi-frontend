// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT: TokenCard
// Display token yang dimiliki user
// ═══════════════════════════════════════════════════════════════════════════

import React from "react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { UserToken } from "@/types/point";
import { getTokenStatusColor } from "@/services/marketplaceService";

interface TokenCardProps {
  token: UserToken;
  section?: "available" | "used" | "expired";
}

export default function TokenCard({ token, section }: TokenCardProps) {
  const statusColor = getTokenStatusColor(token.status);

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Get icon based on status
  const getIcon = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "USED":
        return <Clock className="w-5 h-5 text-slate-600" />;
      case "EXPIRED":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${statusColor.bg} border-slate-200`}>
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon & Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 pt-1">{getIcon(token.status)}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 text-sm leading-snug">
                {token.item_name}
              </h3>
              <p className={`text-xs font-medium mt-1 ${statusColor.text}`}>
                {statusColor.label}
              </p>

              {/* Additional Info Based on Status */}
              {token.status === "AVAILABLE" && (
                <p className="text-xs text-slate-500 mt-2">
                  Diperoleh: {formatDate(token.created_at)}
                </p>
              )}

              {token.status === "USED" && (
                <div className="text-xs text-slate-500 mt-2 space-y-0.5">
                  <p>Digunakan: {formatDate(token.used_at)}</p>
                  {token.used_at_attendance_id && (
                    <p>ID Absensi: #{token.used_at_attendance_id}</p>
                  )}
                </div>
              )}

              {token.status === "EXPIRED" && (
                <p className="text-xs text-slate-500 mt-2">
                  Kadaluarsa: {formatDate(token.created_at)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Status Badge */}
        <span
          className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap flex-shrink-0 ${statusColor.bg} ${statusColor.text}`}
        >
          {statusColor.label}
        </span>
      </div>
    </div>
  );
}

// Skeleton component
export function TokenCardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-100 p-4 space-y-2">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 bg-slate-100 rounded-full animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-1">
          <div className="h-4 bg-slate-100 rounded w-32 animate-pulse" />
          <div className="h-3 bg-slate-100 rounded w-20 animate-pulse" />
          <div className="h-3 bg-slate-100 rounded w-40 animate-pulse mt-2" />
        </div>
      </div>
    </div>
  );
}
