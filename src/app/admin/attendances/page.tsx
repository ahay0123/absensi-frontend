"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  Search,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit2,
  Trash2,
  User as UserIcon,
  X,
  Map,
} from "lucide-react";
import api from "@/lib/axios";

export default function AdminAttendances() {
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<any>({});

  // Modal Edit Status
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: 0, status: "Hadir" });
  const [saving, setSaving] = useState(false);

  // Map / Foto Modal
  const [viewEvidence, setViewEvidence] = useState<any>(null);

  const fetchAttendances = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/admin/attendances?page=${page}&start_date=${dateStart}&end_date=${dateEnd}&status=${statusFilter}&search=${search}`,
      );
      setAttendances(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances();
  }, [dateStart, dateEnd, statusFilter, search]);

  const openEditModal = (att: any) => {
    setFormData({ id: att.id, status: att.status });
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/attendances/${formData.id}`, {
        status: formData.status,
      });
      setIsModalOpen(false);
      fetchAttendances(pagination.current_page);
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal mengupdate");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Yakin ingin menghapus data absensi ini secara permanen?")) {
      try {
        await api.delete(`/admin/attendances/${id}`);
        fetchAttendances(pagination.current_page);
      } catch (err: any) {
        alert(err.response?.data?.message || "Gagal menghapus");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Hadir":
        return (
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max">
            <CheckCircle className="w-3.5 h-3.5" /> Hadir
          </span>
        );
      case "Terlambat":
        return (
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max">
            <Clock className="w-3.5 h-3.5" /> Terlambat
          </span>
        );
      case "Izin":
        return (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max">
            <AlertCircle className="w-3.5 h-3.5" /> Izin/Sakit
          </span>
        );
      default:
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max">
            <XCircle className="w-3.5 h-3.5" /> Alpa
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Data Absensi</h1>
          <p className="text-slate-500 mt-1 text-sm bg-white inline-block">
            Monitor presensi semua guru secara menyeluruh
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama guru..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
            />
          </div>
          <div>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-medium"
            />
          </div>
          <div>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-medium"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-medium"
          >
            <option value="">Semua Status</option>
            <option value="Hadir">Hadir</option>
            <option value="Terlambat">Terlambat</option>
            <option value="Izin">Izin / Sakit</option>
            <option value="Alpa">Alpa</option>
          </select>
        </div>

        {/* Table/List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-slate-100">
                  Guru
                </th>
                <th className="p-4 font-bold border-b border-slate-100">
                  Waktu Validasi
                </th>
                <th className="p-4 font-bold border-b border-slate-100">
                  Status
                </th>
                <th className="p-4 font-bold border-b border-slate-100">
                  Jadwal Kelas
                </th>
                <th className="p-4 font-bold border-b border-slate-100 text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                  </td>
                </tr>
              ) : attendances.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-slate-400 text-sm"
                  >
                    Tidak ada absen ditemukan
                  </td>
                </tr>
              ) : (
                attendances.map((att) => (
                  <tr
                    key={att.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-4 border-b border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <UserIcon className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {att.schedule?.user?.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {att.schedule?.user?.nip}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-b border-slate-50">
                      <div className="text-sm font-bold text-slate-800">
                        {att.tap_time_formatted || "-"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {att.date_formatted}
                      </div>
                    </td>
                    <td className="p-4 border-b border-slate-50">
                      {getStatusBadge(att.status)}
                    </td>
                    <td className="p-4 border-b border-slate-50">
                      <div className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-indigo-500" />{" "}
                        {att.schedule?.room?.name}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {att.schedule?.day},{" "}
                        {att.schedule?.start_time.substring(0, 5)}
                      </div>
                    </td>
                    <td className="p-4 border-b border-slate-50 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setViewEvidence(att.evidence)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                          disabled={!att.evidence}
                        >
                          <Map className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(att)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(att.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

        {/* Pagination Status */}
        {!loading && attendances.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium bg-slate-50">
            <p>
              Data {pagination.from} - {pagination.to} dari total{" "}
              {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.current_page === 1}
                onClick={() => fetchAttendances(pagination.current_page - 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg disabled:opacity-50 transition-colors"
              >
                Sebelumnya
              </button>
              <button
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => fetchAttendances(pagination.current_page + 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg disabled:opacity-50 transition-colors"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Status Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slideDown">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                Koreksi Status
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Ubah Menjadi
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Terlambat">Terlambat</option>
                  <option value="Izin">Izin / Sakit</option>
                  <option value="Alpa">Alpa</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Simpan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Evidence Modal */}
      {viewEvidence && (
        <div
          className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setViewEvidence(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Detail Presensi</h3>
              <button
                onClick={() => setViewEvidence(null)}
                className="p-2 hover:bg-slate-100 text-slate-500 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Image Section - Dikecilkan ukurannya */}
              <div className="relative group">
                <p className="text-[10px] uppercase font-black text-slate-400 mb-2 tracking-widest">
                  Foto Bukti
                </p>
                {viewEvidence.photo_url ? (
                  <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-slate-200 shadow-inner bg-slate-100">
                    <img
                      src={viewEvidence.photo_url}
                      alt="Selfie"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                ) : (
                  <div className="h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                    <XCircle className="w-8 h-8 mb-1 opacity-20" />
                    <span className="text-xs font-medium">Tidak ada foto</span>
                  </div>
                )}
              </div>

              {/* Map Section - Menggunakan Google Maps Link untuk fungsi real */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-black text-slate-400 mb-2 tracking-widest">
                  Lokasi Koordinat
                </p>
                {viewEvidence.latitude && viewEvidence.longitude ? (
                  <div className="space-y-3">
                    <div className="h-32 w-full rounded-2xl overflow-hidden border border-slate-200 relative bg-slate-100">
                      {/* Static Map Mockup with Grid */}
                      <div className="absolute inset-0 bg-[url('https://www.google.com/maps/vt/pb=!1m4!1m3!1i15!2i16447!3i10584!2m3!1e0!2sm!3i407105169!3m8!2sen!3sid!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!1f2!161166651!3m17!2m2!1sen!3sid!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!1f2!161166651')] bg-cover opacity-60"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <span className="absolute -top-2 -left-2 w-8 h-8 bg-red-500/20 rounded-full animate-ping"></span>
                          <MapPin className="w-8 h-8 text-red-600 relative z-10 drop-shadow-lg" />
                        </div>
                      </div>
                      {/* Tombol Buka di Google Maps */}
                      <a
                        href={`https://www.google.com/maps?q=${viewEvidence.latitude},${viewEvidence.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 shadow-sm hover:bg-white flex items-center gap-1.5 border border-slate-200"
                      >
                        <Map className="w-3 h-3" /> Buka Maps
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <p className="text-[9px] text-slate-400 uppercase">
                          Latitude
                        </p>
                        <p className="text-xs font-mono font-bold text-slate-700">
                          {viewEvidence.latitude}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <p className="text-[9px] text-slate-400 uppercase">
                          Longitude
                        </p>
                        <p className="text-xs font-mono font-bold text-slate-700">
                          {viewEvidence.longitude}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-700 leading-tight">
                      Data lokasi tidak tersedia untuk status ini.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 bg-slate-50 flex justify-center">
              <button
                onClick={() => setViewEvidence(null)}
                className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 active:scale-95 transition-all"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
