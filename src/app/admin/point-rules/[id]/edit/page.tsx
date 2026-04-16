// ═══════════════════════════════════════════════════════════════════════════
// PAGE: Admin Edit Point Rule
// Halaman untuk mengedit rule poin yang sudah ada dengan statement builder
// ═══════════════════════════════════════════════════════════════════════════

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import Alert from "@/components/Alert";
import StatementBuilder from "@/components/StatementBuilder";
import { getRuleById, updateRule } from "@/services/adminPointService";
import { PointRule, UpdateRulePayload } from "@/types/point";

export default function AdminEditPointRulePage() {
  const router = useRouter();
  const params = useParams();
  const ruleId = parseInt(params.id as string);

  const [rule, setRule] = useState<PointRule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  // Fetch rule on mount
  useEffect(() => {
    const fetchRule = async () => {
      try {
        const result = await getRuleById(ruleId);
        setRule(result);
        setFormData({
          rule_name: result.rule_name,
          target_role: result.target_role,
          condition_type: result.condition_type,
          condition_operator: result.condition_operator,
          condition_value: result.condition_value,
          point_modifier: result.point_modifier,
          is_active: result.is_active,
        });
      } catch (err: any) {
        setError(err.message || "Gagal mengambil data rule");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRule();
  }, [ruleId]);

  const handleBuilderChange = (data: any) => {
    setFormData({
      ...formData,
      condition_type: data.condition_type,
      condition_operator: data.condition_operator,
      condition_value: data.condition_value,
      point_modifier: data.point_modifier,
    });
  };

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
      setIsSaving(true);

      const payload: UpdateRulePayload = {
        rule_name: formData.rule_name,
        point_modifier: formData.point_modifier,
        is_active: formData.is_active,
      };

      await updateRule(ruleId, payload);
      setSuccess(true);

      // Redirect setelah 1.5 detik
      setTimeout(() => {
        router.push("/admin/point-rules");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Gagal mengupdate rule");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="text-slate-600 font-semibold">Memuat data rule...</p>
        </div>
      </div>
    );
  }

  if (!rule) {
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
            message="Rule dengan ID ini tidak dapat ditemukan"
            onClose={() => router.push("/admin/point-rules")}
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
            ✏️ Edit Rule Poin
          </h1>
          <p className="text-slate-600 mt-2">
            Update aturan poin untuk {rule.rule_name}
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
              message="Rule telah berhasil diupdate. Redirecting..."
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
                disabled={isSaving}
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
                    disabled={isSaving}
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
                  disabled={isSaving}
                />
                <span className="text-sm font-semibold text-slate-900">
                  Aktifkan rule ini
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

            {/* Original Rule Reference */}
            {rule && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  📌 Rule Asli
                </p>
                <p className="text-xs text-slate-600">
                  JIKA {rule.condition_type.replace(/_/g, " ")}{" "}
                  {rule.condition_operator} {rule.condition_value} MAKA POIN{" "}
                  {rule.point_modifier > 0 ? "+" : ""}
                  {rule.point_modifier}
                </p>
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
                  "Update Rule"
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
            <li>Perubahan akan berlaku ke semua pengguna segera</li>
            <li>
              Pertimbangkan dampak terhadap data historis pengguna yang sudah
              ada
            </li>
            <li>Backup rule asli sebelum membuat perubahan signifikan</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
