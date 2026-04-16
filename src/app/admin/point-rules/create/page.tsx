// ═══════════════════════════════════════════════════════════════════════════
// PAGE: Admin Create Point Rule
// Halaman untuk membuat rule poin baru dengan statement builder
// ═══════════════════════════════════════════════════════════════════════════

"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Alert from "@/components/Alert";
import StatementBuilder from "@/components/StatementBuilder";
import { createRule } from "@/services/adminPointService";
import { CreateRulePayload } from "@/types/point";

export default function AdminCreatePointRulePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    rule_name: "",
    target_role: "guru" as "guru" | "siswa" | "karyawan",
    condition_type: "arrival_time" as
      | "arrival_time"
      | "lateness"
      | "absence"
      | "early_arrival",
    condition_operator: "<" as "<" | ">" | "==" | "BETWEEN",
    condition_value: "",
    point_modifier: 0,
    is_active: true,
  });

  
  const handleBuilderChange = useCallback((data: any) => {
    setFormData((prev) => ({
      ...prev,
      condition_type: data.condition_type,
      condition_operator: data.condition_operator,
      condition_value: data.condition_value,
      point_modifier: data.point_modifier,
    }));
  }, []);   

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.rule_name.trim()) {
      setError("Nama rule harus diisi");
      return;
    }

    if (!formData.condition_value) {
      setError("Nilai kondisi harus diisi");
      return;
    }

    if (formData.point_modifier === 0) {
      setError("Poin modifier tidak boleh 0");
      return;
    }

    try {
      setIsLoading(true);

      const payload: CreateRulePayload = {
        rule_name: formData.rule_name,
        target_role: formData.target_role,
        condition_type: formData.condition_type,
        condition_operator: formData.condition_operator,
        condition_value: formData.condition_value,
        point_modifier: formData.point_modifier,
        is_active: formData.is_active,
      };

      await createRule(payload);
      setSuccess(true);

      // Redirect setelah 1.5 detik
      setTimeout(() => {
        router.push("/admin/point-rules");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Gagal membuat rule");
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
            ➕ Buat Rule Poin Baru
          </h1>
          <p className="text-slate-600 mt-2">
            Buat aturan baru untuk mengelola poin integritas pengguna
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
              message="Rule telah berhasil dibuat. Redirecting..."
              onClose={() => {}}
              duration={0}
            />
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
            {/* Rule Name */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">
                Nama Rule *
              </label>
              <input
                type="text"
                value={formData.rule_name}
                onChange={(e) =>
                  setFormData({ ...formData, rule_name: e.target.value })
                }
                placeholder="Contoh: Hadir Tepat Waktu"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <p className="text-xs text-slate-500">
                Deskripsi singkat untuk identifikasi rule ini
              </p>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">
                Berlaku Untuk Role *
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: "guru", label: "👨‍🏫 Guru" },
                  { value: "siswa", label: "🧑‍🎓 Siswa" },
                  { value: "karyawan", label: "👔 Karyawan" },
                ].map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        target_role: role.value as
                          | "guru"
                          | "siswa"
                          | "karyawan",
                      })
                    }
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      formData.target_role === role.value
                        ? "bg-blue-600 text-white ring-2 ring-blue-400"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                    disabled={isLoading}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Statement Builder */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">
                Kondisi & Poin Modifier *
              </label>
              <StatementBuilder
                value={formData}
                onChange={handleBuilderChange}
              />
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
                  Aktifkan rule ini sekarang
                </span>
              </label>
              <p className="text-xs text-slate-500">
                Rule yang tidak aktif tidak akan mempengaruhi perhitungan poin
              </p>
            </div>

            {/* Preview */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-2">
              <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                📋 Preview Rule
              </p>
              <p className="text-sm text-blue-900 font-semibold">
                JIKA {formData.condition_type.replace(/_/g, " ")}{" "}
                {formData.condition_operator} {formData.condition_value} MAKA
                POIN {formData.point_modifier > 0 ? "+" : ""}
                {formData.point_modifier}
              </p>
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
                  "Buat Rule"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-xl p-6 space-y-3">
          <p className="text-sm font-bold text-indigo-900">
            ℹ️ Catatan Penting
          </p>
          <ul className="text-xs text-indigo-800 space-y-2 list-disc list-inside">
            <li>
              Rule akan berlaku ke semua pengguna dengan role yang dipilih
            </li>
            <li>
              Gunakan operator "BETWEEN" untuk range nilai (format: min-max)
            </li>
            <li>
              Poin modifier positif (+) menambah poin, negatif (-) mengurangi
            </li>
            <li>
              Rule yang duplikat akan diabaikan, pastikan tidak ada rule serupa
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
