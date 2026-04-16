// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT: WalletTabs
// Tab navigation untuk Dompet (Riwayat, Marketplace, Inventory)
// ═══════════════════════════════════════════════════════════════════════════

import React, { ReactNode } from "react";
import { History, ShoppingCart, Package } from "lucide-react";

export type WalletTabType = "history" | "marketplace" | "inventory";

interface Tab {
  id: WalletTabType;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface WalletTabsProps {
  activeTab: WalletTabType;
  onTabChange: (tab: WalletTabType) => void;
  inventoryBadge?: number;
  children: ReactNode;
}

export default function WalletTabs({
  activeTab,
  onTabChange,
  inventoryBadge = 0,
  children,
}: WalletTabsProps) {
  const tabs: Tab[] = [
    {
      id: "history",
      label: "Riwayat Mutasi",
      icon: <History className="w-5 h-5" />,
    },
    {
      id: "marketplace",
      label: "Marketplace",
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: <Package className="w-5 h-5" />,
      badge: inventoryBadge > 0 ? inventoryBadge : undefined,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 min-w-max flex items-center justify-center gap-2 px-4 py-4 border-b-2 transition-all font-medium text-sm relative ${
                  isActive
                    ? "border-indigo-600 text-indigo-600 bg-indigo-50"
                    : "border-transparent text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">{children}</div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}
