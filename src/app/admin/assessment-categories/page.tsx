"use client";
import React, { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  Plus,
  Search,
  Edit2,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
  X,
  AlertCircle,
  CheckCircle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import api from "@/lib/axios";

interface AssessmentCategory {
  id: number;
  name: string;
  description: string;
  type: string;
  is_active: boolean;
  created_at: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function AssessmentCategoriesPage() {
  const [categories, setCategories] = useState<AssessmentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState({
    id: null as number | null,
    name: "",
    description: "",
    type: "",
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Delete Confirmation Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<"delete" | "deactivate">(
    "delete",
  );

  // Sorting
  const [sortBy, setSortBy] = useState<"name" | "created_at">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchCategories = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await api.get(
          `/admin/assessment-categories?page=${page}&search=${search}`,
        );
        setCategories(res.data.data);
        setPagination(res.data.pagination);
        setErrorMsg("");
      } catch (err) {
        console.error("Error fetching categories:", err);
        setErrorMsg("Gagal memuat data indikator penilaian");
      } finally {
        setLoading(false);
      }
    },
    [search],
  );

  useEffect(() => {
    fetchCategories();
  }, [search, fetchCategories]);

  const openCreateModal = () => {
    setModalMode("create");
    setFormData({ id: null, name: "", description: "", type: "" });
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (category: AssessmentCategory) => {
    setModalMode("edit");
    setFormData({
      id: category.id,
      name: category.name,
      description: category.description,
      type: category.type,
    });
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ id: null, name: "", description: "", type: "" });
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.type.trim()) {
      setErrorMsg("Nama dan Tipe harus diisi");
      return;
    }

    setSaving(true);
    try {
      if (modalMode === "create") {
        await api.post("/admin/assessment-categories", {
          name: formData.name,
          description: formData.description,
          type: formData.type,
        });
        setSuccessMsg("Indikator penilaian berhasil ditambahkan!");
      } else {
        await api.put(`/admin/assessment-categories/${formData.id}`, {
          name: formData.name,
          description: formData.description,
          type: formData.type,
        });
        setSuccessMsg("Indikator penilaian berhasil diperbarui!");
      }

      setTimeout(() => {
        closeModal();
        fetchCategories();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || "Terjadi kesalahan saat menyimpan",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/assessment-categories/${id}/toggle-status`);
      setSuccessMsg(
        currentStatus ? "Indikator dinonaktifkan" : "Indikator diaktifkan",
      );
      fetchCategories();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg("Gagal mengubah status");
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteItemId(id);
    setDeleteType("delete");
    setIsDeleteModalOpen(true);
  };

  const handleDeactivateClick = (id: number) => {
    setDeleteItemId(id);
    setDeleteType("deactivate");
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      if (deleteType === "delete") {
        await api.delete(`/admin/assessment-categories/${deleteItemId}`);
        setSuccessMsg("Indikator penilaian berhasil dihapus");
      } else {
        await api.patch(
          `/admin/assessment-categories/${deleteItemId}/toggle-status`,
        );
        setSuccessMsg("Indikator penilaian berhasil dinonaktifkan");
      }

      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
      fetchCategories();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg("Gagal melakukan aksi");
    }
  };

  const sortedCategories = [...categories].sort((a, b) => {
    let compareA, compareB;

    if (sortBy === "name") {
      compareA = a.name.toLowerCase();
      compareB = b.name.toLowerCase();
    } else {
      compareA = new Date(a.created_at).getTime();
      compareB = new Date(b.created_at).getTime();
    }

    return sortOrder === "asc"
      ? compareA > compareB
        ? 1
        : -1
      : compareA < compareB
        ? 1
        : -1;
  });

  const toggleSort = (col: "name" | "created_at") => {
    if (sortBy === col) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortOrder("asc");
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Indikator Penilaian
              </h1>
              <p className="text-slate-600 mt-2">
                Kelola indikator penilaian kedisiplinan guru dengan mudah
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
            >
              <Plus size={20} />
              <span>Tambah Indikator Baru</span>
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMsg && (
          <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-5 py-4 rounded-lg animate-slide-in">
            <CheckCircle size={20} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-lg">
            <AlertCircle size={20} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Cari indikator penilaian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => toggleSort("name")}
                      className="flex items-center gap-2 font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      Nama Indikator
                      {sortBy === "name" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        ))}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">
                    Tipe
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">
                    Deskripsi
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => toggleSort("created_at")}
                      className="flex items-center gap-2 font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      Dibuat
                      {sortBy === "created_at" &&
                        (sortOrder === "asc" ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        ))}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-900">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2
                          size={20}
                          className="animate-spin text-blue-600"
                        />
                        <span className="text-slate-600">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : sortedCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-slate-500">
                        <p className="text-lg">Belum ada indikator penilaian</p>
                        <p className="text-sm mt-1">
                          Klik tombol "Tambah Indikator Baru" untuk memulai
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedCategories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {category.type}
                      </td>
                      <td className="px-6 py-4 text-slate-600 truncate">
                        {category.description}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {category.created_at}
                      </td>
                      <td className="px-6 py-4">
                        {category.is_active ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                            <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditModal(category)}
                            className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeactivateClick(category.id)}
                            className={`p-2 ${
                              category.is_active
                                ? "hover:bg-yellow-100 text-yellow-600"
                                : "hover:bg-green-100 text-green-600"
                            } rounded-lg transition-colors`}
                            title={
                              category.is_active ? "Nonaktifkan" : "Aktifkan"
                            }
                          >
                            {category.is_active ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(category.id)}
                            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-slate-200 bg-slate-50">
              <span className="text-sm text-slate-600">
                Halaman {pagination.current_page} dari {pagination.last_page}{" "}
                (Total: {pagination.total})
              </span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.current_page === 1}
                  onClick={() => fetchCategories(pagination.current_page - 1)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sebelumnya
                </button>
                <button
                  disabled={pagination.current_page === pagination.last_page}
                  onClick={() => fetchCategories(pagination.current_page + 1)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-96 overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold text-slate-900">
                {modalMode === "create"
                  ? "Tambah Indikator Penilaian Baru"
                  : "Edit Indikator Penilaian"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {errorMsg && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  <AlertCircle size={18} />
                  <span className="text-sm">{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Nama Indikator *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Contoh: Kehadiran Tepat Waktu"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Tipe *
                </label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  placeholder="Contoh: Kedisiplinan"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Jelaskan indikator penilaian ini..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
              >
                {saving && <Loader2 size={18} className="animate-spin" />}
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
                {deleteType === "delete"
                  ? "Hapus Indikator?"
                  : "Nonaktifkan Indikator?"}
              </h3>

              <p className="text-slate-600 text-center text-sm mb-6">
                {deleteType === "delete"
                  ? "Indikator penilaian akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan."
                  : "Indikator penilaian akan dinonaktifkan dan tidak akan muncul dalam proses penilaian."}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium ${
                    deleteType === "delete"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-yellow-600 hover:bg-yellow-700"
                  }`}
                >
                  {deleteType === "delete" ? "Hapus" : "Nonaktifkan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
