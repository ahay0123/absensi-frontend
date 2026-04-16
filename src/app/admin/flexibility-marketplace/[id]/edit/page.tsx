// ═══════════════════════════════════════════════════════════════════════════
// PAGE: Admin Edit Marketplace Item
// Halaman untuk mengedit item marketplace yang sudah ada
// ═══════════════════════════════════════════════════════════════════════════

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import Alert from "@/components/Alert";
import { getItemById, updateItem } from "@/services/adminPointService";
import { AdminFlexibilityItem, UpdateItemPayload } from "@/types/point";

export default function AdminEditMarketplaceItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = parseInt(params.id as string);

  const [item, setItem] = useState<AdminFlexibilityItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    item_name: "",
    point_cost: 0,
    stock_limit: null as number | null,
    is_active: true,
  });

  // Fetch item on mount
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const result = await getItemById(itemId);
        setItem(result);
        setFormData({
          item_name: result.item_name,
          point_cost: result.point_cost,
          stock_limit: result.stock_limit,
          is_active: result.is_active,
        });
      } catch (err: any) {
        setError(err.message || "Gagal mengambil data item");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.item_name.trim()) {
      setError("Nama item harus diisi");
      return;
    }

    if (formData.point_cost <= 0) {
      setError("Biaya poin harus lebih dari 0");
      return;
    }

    try {
      setIsSaving(true);

      const payload: UpdateItemPayload = {
        item_name: formData.item_name,
        point_cost: formData.point_cost,
        stock_limit: formData.stock_limit,
        is_active: formData.is_active,
      };

      await updateItem(itemId, payload);
      setSuccess(true);

      // Redirect setelah 1.5 detik
      setTimeout(() => {
        router.push("/admin/flexibility-marketplace");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Gagal mengupdate item");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="text-slate-600 font-semibold">Memuat data item...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Kembali
          </button>
          <Alert
            type="error"
            message="Item dengan ID ini tidak dapat ditemukan"
            onClose={() => router.push("/admin/flexibility-marketplace")}
            duration={0}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Kembali
          </button>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            ✏️ Edit Item Marketplace
          </h1>
          <p className="text-slate-600 mt-2">
            Update informasi item {item.item_name}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6">
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
              duration={0}
            />
          </div>
        )}

        {success && (
          <div className="mb-6">
            <Alert
              type="success"
              message="Item telah berhasil diupdate. Redirecting..."
              onClose={() => {}}
              duration={0}
            />
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
            {/* Item Name */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">
                Nama Item *
              </label>
              <input
                type="text"
                value={formData.item_name}
                onChange={(e) =>
                  setFormData({ ...formData, item_name: e.target.value })
                }
                placeholder="Contoh: Liburan 2 jam"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSaving}
              />
              <p className="text-xs text-slate-500">
                Nama unik yang mudah diingat untuk item ini
              </p>
            </div>

            {/* Point Cost */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">
                Biaya Poin 🪙 *
              </label>
              <input
                type="number"
                value={formData.point_cost}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    point_cost: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Contoh: 100"
                min="1"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSaving}
              />
              <p className="text-xs text-slate-500">
                Jumlah poin yang diperlukan untuk membeli item ini
              </p>
            </div>

            {/* Stock Limit */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">
                Batas Stok (Opsional)
              </label>
              <input
                type="number"
                value={formData.stock_limit || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock_limit: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
                placeholder="Kosongkan untuk stok unlimited"
                min="1"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSaving}
              />
              <p className="text-xs text-slate-500">
                Jumlah maksimal yang bisa ditukar atau kosongkan untuk unlimited
              </p>
            </div>

            {/* Active Status */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  disabled={isSaving}
                />
                <span className="text-sm font-semibold text-slate-900">
                  Aktifkan item ini
                </span>
              </label>
              <p className="text-xs text-slate-500">
                Item yang tidak aktif tidak akan ditampilkan di marketplace
              </p>
            </div>

            {/* Preview */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-2">
                👁️ Preview
              </p>
              <div className="text-sm space-y-1">
                <p className="text-blue-900">
                  <strong>{formData.item_name || "Nama Item"}</strong>
                </p>
                <p className="text-blue-700 text-xs">
                  🪙 {formData.point_cost} poin
                  {formData.stock_limit && ` • Stok: ${formData.stock_limit}`}
                </p>
              </div>
            </div>

            {/* Original Item Reference */}
            {item && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  📌 Item Asli
                </p>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    <strong>{item.item_name}</strong>
                  </p>
                  <p>
                    🪙 {item.point_cost} poin
                    {item.stock_limit && ` • Stok: ${item.stock_limit}`}
                  </p>
                  <p>
                    Status:{" "}
                    {item.is_active ? (
                      <span className="text-green-600 font-semibold">
                        ✓ Aktif
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        ✗ Nonaktif
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-900 rounded-lg font-bold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Update Item"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-xl p-6 space-y-3">
          <p className="text-sm font-bold text-indigo-900">
            ℹ️ Tips Mengedit Item
          </p>
          <ul className="text-xs text-indigo-800 space-y-2 list-disc list-inside">
            <li>Perubahan harga akan berlaku untuk pembelian selanjutnya</li>
            <li>
              Non-aktifkan item jika sudah tidak tersedia tanpa menghapusnya
            </li>
            <li>Stok limit bisa disesuaikan untuk promosi musiman</li>
            <li>Pertahankan konsistensi nama item untuk kemudahan pengguna</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
