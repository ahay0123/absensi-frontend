"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Search, Loader2, Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, Edit2, Trash2, User as UserIcon, X, Map } from "lucide-react";
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
            const res = await api.get(`/admin/attendances?page=${page}&start_date=${dateStart}&end_date=${dateEnd}&status=${statusFilter}&search=${search}`);
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
            await api.put(`/admin/attendances/${formData.id}`, { status: formData.status });
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
            case 'Hadir': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><CheckCircle className="w-3.5 h-3.5" /> Hadir</span>;
            case 'Terlambat': return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><Clock className="w-3.5 h-3.5" /> Terlambat</span>;
            case 'Izin': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><AlertCircle className="w-3.5 h-3.5" /> Izin/Sakit</span>;
            default: return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><XCircle className="w-3.5 h-3.5" /> Alpa</span>;
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Data Absensi</h1>
                    <p className="text-slate-500 mt-1 text-sm bg-white inline-block">Monitor presensi semua guru secara menyeluruh</p>
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
                                <th className="p-4 font-bold border-b border-slate-100">Guru</th>
                                <th className="p-4 font-bold border-b border-slate-100">Waktu Validasi</th>
                                <th className="p-4 font-bold border-b border-slate-100">Status</th>
                                <th className="p-4 font-bold border-b border-slate-100">Jadwal Kelas</th>
                                <th className="p-4 font-bold border-b border-slate-100 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" /></td></tr>
                            ) : attendances.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-400 text-sm">Tidak ada absen ditemukan</td></tr>
                            ) : (
                                attendances.map((att) => (
                                    <tr key={att.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4 border-b border-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                    <UserIcon className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{att.schedule?.user?.name}</p>
                                                    <p className="text-[10px] text-slate-400">{att.schedule?.user?.nip}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 border-b border-slate-50">
                                            <div className="text-sm font-bold text-slate-800">{att.tap_time_formatted || '-'}</div>
                                            <div className="text-xs text-slate-500">{att.date_formatted}</div>
                                        </td>
                                        <td className="p-4 border-b border-slate-50">
                                            {getStatusBadge(att.status)}
                                        </td>
                                        <td className="p-4 border-b border-slate-50">
                                            <div className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded inline-flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-indigo-500" /> {att.schedule?.room?.name}
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-1">
                                                {att.schedule?.day}, {att.schedule?.start_time.substring(0, 5)}
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
                                                <button onClick={() => openEditModal(att)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(att.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
                        <p>Data {pagination.from} - {pagination.to} dari total {pagination.total}</p>
                        <div className="flex gap-2">
                            <button disabled={pagination.current_page === 1} onClick={() => fetchAttendances(pagination.current_page - 1)} className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg disabled:opacity-50 transition-colors">Sebelumnya</button>
                            <button disabled={pagination.current_page === pagination.last_page} onClick={() => fetchAttendances(pagination.current_page + 1)} className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg disabled:opacity-50 transition-colors">Selanjutnya</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Status Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slideDown">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800">Koreksi Status</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Ubah Menjadi</label>
                                <select required value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-600">
                                    <option value="Hadir">Hadir</option>
                                    <option value="Terlambat">Terlambat</option>
                                    <option value="Izin">Izin / Sakit</option>
                                    <option value="Alpa">Alpa</option>
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-colors">Batal</button>
                                <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center gap-2">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Evidence Modal */}
            {viewEvidence && (
                <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setViewEvidence(null)}>
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800">Bukti Absensi & Lokasi</h3>
                            <button onClick={() => setViewEvidence(null)} className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 bg-slate-50">
                            {viewEvidence.photo_url ? (
                                <img src={viewEvidence.photo_url} alt="Selfie Absensi" className="w-full h-auto aspect-square object-cover rounded-2xl mb-4 border-4 border-white shadow-sm" />
                            ) : (
                                <div className="w-full aspect-square bg-slate-200 rounded-2xl mb-4 flex items-center justify-center text-slate-400 flex-col gap-2">
                                    <XCircle className="w-8 h-8" />
                                    <span className="text-sm font-medium">Foto tidak tersedia</span>
                                </div>
                            )}

                            <div className="bg-white p-4 rounded-2xl border border-slate-100">
                                <p className="text-xs uppercase font-bold text-slate-400 mb-2">Data Koordinat GPS</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">Lat: {viewEvidence.latitude}</p>
                                        <p className="text-sm font-bold text-slate-800">Lng: {viewEvidence.longitude}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
