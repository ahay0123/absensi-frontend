// ═══════════════════════════════════════════════════════════════════════════
// PAGE: Admin Create Marketplace Item
// Halaman untuk membuat item marketplace baru
// ═══════════════════════════════════════════════════════════════════════════

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Alert from "@/components/Alert";
import { createItem } from "@/services/adminPointService";
import { CreateItemPayload } from "@/types/point";

export default function AdminCreateMarketplaceItemPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    item_name: "",
    point_cost: 0,
    stock_limit: null as number | null,
    is_active: true,
  });

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
      setIsLoading(true);

      const payload: CreateItemPayload = {
        item_name: formData.item_name,
        point_cost: formData.point_cost,
        stock_limit: formData.stock_limit,
        is_active: formData.is_active,
      };

      await createItem(payload);
      setSuccess(true);

      // Redirect setelah 1.5 detik
      setTimeout(() => {
        router.push("/admin/flexibility-marketplace");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Gagal membuat item");
    } finally {
      setIsLoading(false);
    }
  };

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
            ➕ Buat Item Marketplace Baru
          </h1>
          <p className="text-slate-600 mt-2">
            Tambahkan item reward baru yang bisa ditukar dengan poin
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
              message="Item telah berhasil dibuat. Redirecting..."
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
                placeholder="Contoh: Liburan 2 jam, Sertifikat, Voucher Makan"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                  disabled={isLoading}
                />
                <span className="text-sm font-semibold text-slate-900">
                  Aktifkan item ini sekarang
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

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-900 rounded-lg font-bold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Buat Item"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-xl p-6 space-y-3">
          <p className="text-sm font-bold text-indigo-900">
            ℹ️ Tips Membuat Item
          </p>
          <ul className="text-xs text-indigo-800 space-y-2 list-disc list-inside">
            <li>
              Buat nama item yang menarik dan mudah dipahami oleh pengguna
            </li>
            <li>
              Tentukan harga poin yang kompetitif dan sesuai dengan nilai reward
            </li>
            <li>
              Gunakan batas stok untuk item limited edition atau promosi khusus
            </li>
            <li>Pastikan item aktif untuk dapat dibeli oleh pengguna</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
