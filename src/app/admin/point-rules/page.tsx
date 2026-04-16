// ═══════════════════════════════════════════════════════════════════════════
// ADMIN POINT RULES PAGE
// Manage point rules (CRUD operations)
// ═══════════════════════════════════════════════════════════════════════════

"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, RefreshCw, Loader2, Search } from "lucide-react";
import api from "@/lib/axios";
import Alert, { useAlert } from "@/components/Alert";
import AdminLayout from "@/components/AdminLayout";
import {
  getRules,
  deleteRule,
  toggleRule,
  getConditionTypeLabel,
  getOperatorLabel,
  getRoleLabel,
} from "@/services/adminPointService";
import { PointRule, TargetRole } from "@/types/point";

export default function AdminPointRulesPage() {
  const router = useRouter();
  const { alert, showAlert, hideAlert } = useAlert();

  const [rules, setRules] = useState<PointRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<TargetRole | "">("");
  const [filterActive, setFilterActive] = useState<boolean | "">("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Fetch rules
  const fetchRules = async () => {
    try {
      setIsLoading(true);
      const data = await getRules({
        role: filterRole || undefined,
        is_active: filterActive !== "" ? filterActive : undefined,
      });
      setRules(data.data);
    } catch (err: any) {
      showAlert(
        "error",
        err?.response?.data?.message || "Gagal memuat aturan poin",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchRules();
  }, []);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchRules();
      showAlert("success", "Data berhasil diperbarui");
    } catch (err) {
      showAlert("error", "Gagal memperbarui data");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Delete handler
  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus rule ini?")) return;

    setDeletingId(id);
    try {
      await deleteRule(id);
      setRules(rules.filter((r) => r.id !== id));
      showAlert("success", "Rule berhasil dihapus");
    } catch (err: any) {
      showAlert(
        "error",
        err?.response?.data?.message || "Gagal menghapus rule",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle handler
  const handleToggle = async (id: number) => {
    setTogglingId(id);
    try {
      const updated = await toggleRule(id);
      setRules(rules.map((r) => (r.id === id ? updated : r)));
      showAlert(
        "success",
        updated.is_active ? "Rule diaktifkan" : "Rule dinonaktifkan",
      );
    } catch (err: any) {
      showAlert(
        "error",
        err?.response?.data?.message || "Gagal mengubah status rule",
      );
    } finally {
      setTogglingId(null);
    }
  };

  // Filter rules based on search
  const filteredRules = rules.filter((rule) =>
    rule.rule_name.toLowerCase().includes(searchTerm.toLowerCase()),
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
            <h1 className="text-3xl font-bold text-slate-900">Aturan Poin</h1>
            <p className="text-slate-600 text-sm mt-1">
              Kelola aturan poin otomatis untuk guru
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
              onClick={() => router.push("/admin/point-rules/create")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Tambah Rule
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-100 p-4 mb-6 space-y-4">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama rule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-b-2 border-slate-200 focus:border-indigo-600 outline-none py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={filterRole}
              onChange={(e) =>
                setFilterRole((e.target.value as TargetRole) || "")
              }
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-600 focus:outline-none"
            >
              <option value="">Semua Role</option>
              <option value="guru">Guru</option>
              <option value="siswa">Siswa</option>
              <option value="karyawan">Karyawan</option>
            </select>

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
        </div>

        {/* Error State */}
        {!isLoading && rules.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-100 p-8 text-center">
            <p className="text-slate-500 text-sm mb-4">Belum ada aturan poin</p>
            <button
              onClick={() => router.push("/admin/point-rules/create")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Buat Rule Pertama
            </button>
          </div>
        )}

        {/* Rules Table */}
        {filteredRules.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                    Nama Rule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                    Kondisi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                    Poin
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
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400" />
                    </td>
                  </tr>
                ) : (
                  filteredRules.map((rule) => (
                    <tr
                      key={rule.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900 text-sm">
                          {rule.rule_name}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {getRoleLabel(rule.target_role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {getConditionTypeLabel(rule.condition_type)}{" "}
                        {getOperatorLabel(rule.condition_operator)}{" "}
                        {rule.condition_value}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-semibold ${
                            rule.point_modifier > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {rule.point_modifier > 0 ? "+" : ""}
                          {rule.point_modifier}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggle(rule.id)}
                          disabled={togglingId === rule.id}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            rule.is_active
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          } disabled:opacity-50`}
                        >
                          {rule.is_active ? "Aktif" : "Nonaktif"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              router.push(`/admin/point-rules/${rule.id}/edit`)
                            }
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(rule.id)}
                            disabled={deletingId === rule.id}
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
        {isLoading && rules.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-100 p-8 text-center">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400 mb-3" />
            <p className="text-slate-500 text-sm">Memuat data...</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
