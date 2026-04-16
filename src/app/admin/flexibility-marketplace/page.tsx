// ═══════════════════════════════════════════════════════════════════════════
// ADMIN FLEXIBILITY MARKETPLACE PAGE
// Manage flexibility items (CRUD operations)
// ═══════════════════════════════════════════════════════════════════════════

"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, RefreshCw, Loader2, Search } from "lucide-react";
import api from "@/lib/axios";
import Alert, { useAlert } from "@/components/Alert";
import AdminLayout from "@/components/AdminLayout";
import {
  getMarketplaceItems,
  deleteItem,
  toggleItem,
} from "@/services/adminPointService";
import { AdminFlexibilityItem } from "@/types/point";

export default function AdminMarketplacePage() {
  const router = useRouter();
  const { alert, showAlert, hideAlert } = useAlert();

  const [items, setItems] = useState<AdminFlexibilityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | "">("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Fetch items
  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const data = await getMarketplaceItems({
        is_active: filterActive !== "" ? filterActive : undefined,
      });
      setItems(data.data);
    } catch (err: any) {
      showAlert(
        "error",
        err?.response?.data?.message || "Gagal memuat item marketplace",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchItems();
  }, []);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchItems();
      showAlert("success", "Data berhasil diperbarui");
    } catch (err) {
      showAlert("error", "Gagal memperbarui data");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Delete handler
  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus item ini?")) return;

    setDeletingId(id);
    try {
      await deleteItem(id);
      setItems(items.filter((i) => i.id !== id));
      showAlert("success", "Item berhasil dihapus");
    } catch (err: any) {
      showAlert(
        "error",
        err?.response?.data?.message || "Gagal menghapus item",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle handler
  const handleToggle = async (id: number) => {
    setTogglingId(id);
    try {
      const updated = await toggleItem(id);
      setItems(items.map((i) => (i.id === id ? updated : i)));
      showAlert(
        "success",
        updated.is_active ? "Item diaktifkan" : "Item dinonaktifkan",
      );
    } catch (err: any) {
      showAlert(
        "error",
        err?.response?.data?.message || "Gagal mengubah status item",
      );
    } finally {
      setTogglingId(null);
    }
  };

  // Filter items based on search
  const filteredItems = items.filter((item) =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50 p-6">
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
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Marketplace Token
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Kelola item yang dapat ditukar dengan poin guru
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-3 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 text-slate-600 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={() =>
                router.push("/admin/flexibility-marketplace/create")
              }
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Tambah Item
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-100 p-4 mb-6 space-y-4">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-b-2 border-slate-200 focus:border-indigo-600 outline-none py-2 text-sm"
            />
          </div>

          <select
            value={filterActive === "" ? "" : String(filterActive)}
            onChange={(e) =>
              setFilterActive(
                e.target.value === "" ? "" : e.target.value === "true",
              )
            }
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-600 focus:outline-none"
          >
            <option value="">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>

        {/* Error State */}
        {!isLoading && items.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-100 p-8 text-center">
            <p className="text-slate-500 text-sm mb-4">
              Belum ada item marketplace
            </p>
            <button
              onClick={() =>
                router.push("/admin/flexibility-marketplace/create")
              }
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Buat Item Pertama
            </button>
          </div>
        )}

        {/* Items Table */}
        {filteredItems.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                    Nama Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                    Harga Poin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                    Batas Stok
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400" />
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900 text-sm">
                          {item.item_name}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-lg">🪙</span>
                          <span className="font-semibold text-slate-900">
                            {item.point_cost.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.stock_limit === null ? (
                          <span className="text-green-600 font-medium">
                            Unlimited
                          </span>
                        ) : (
                          item.stock_limit
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggle(item.id)}
                          disabled={togglingId === item.id}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            item.is_active
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          } disabled:opacity-50`}
                        >
                          {item.is_active ? "Aktif" : "Nonaktif"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              router.push(
                                `/admin/flexibility-marketplace/${item.id}/edit`,
                              )
                            }
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Loading State */}
        {isLoading && items.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-100 p-8 text-center">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400 mb-3" />
            <p className="text-slate-500 text-sm">Memuat data...</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
