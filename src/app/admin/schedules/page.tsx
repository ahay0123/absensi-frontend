"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Plus, Edit2, Trash2, Loader2, X, Calendar, Clock, MapPin, User as UserIcon } from "lucide-react";
import api from "@/lib/axios";

export default function AdminSchedules() {
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Helpers dropdown data
    const [usersList, setUsersList] = useState<any[]>([]);
    const [roomsList, setRoomsList] = useState<any[]>([]);

    // Filters
    const [userFilter, setUserFilter] = useState("");
    const [dayFilter, setDayFilter] = useState("");
    const [pagination, setPagination] = useState<any>({});

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [formData, setFormData] = useState({
        id: null, user_id: "", room_id: "", day: "Senin", start_time: "", end_time: ""
    });
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const fetchDropdowns = async () => {
        try {
            const [uRes, rRes] = await Promise.all([
                api.get("/admin/schedules-users"),
                api.get("/admin/schedules-rooms")
            ]);
            setUsersList(uRes.data.data);
            setRoomsList(rRes.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSchedules = async (page = 1) => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/schedules?page=${page}&user_id=${userFilter}&day=${dayFilter}`);
            setSchedules(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDropdowns();
    }, []);

    useEffect(() => {
        fetchSchedules();
    }, [userFilter, dayFilter]);

    const openCreateModal = () => {
        setModalMode("create");
        setFormData({ id: null, user_id: usersList[0]?.id || "", room_id: roomsList[0]?.id || "", day: "Senin", start_time: "", end_time: "" });
        setErrorMsg("");
        setIsModalOpen(true);
    };

    const openEditModal = (sched: any) => {
        setModalMode("edit");
        setFormData({
            id: sched.id,
            user_id: sched.user.id,
            room_id: sched.room.id,
            day: sched.day,
            start_time: sched.start_time.substring(0, 5),
            end_time: sched.end_time.substring(0, 5)
        });
        setErrorMsg("");
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg("");

        try {
            if (modalMode === "create") {
                await api.post("/admin/schedules", formData);
            } else {
                await api.put(`/admin/schedules/${formData.id}`, formData);
            }
            setIsModalOpen(false);
            fetchSchedules(pagination.current_page);
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || "Terjadi kesalahan");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Yakin ingin menghapus jadwal ini?")) {
            try {
                await api.delete(`/admin/schedules/${id}`);
                fetchSchedules(pagination.current_page);
            } catch (err: any) {
                alert(err.response?.data?.message || "Gagal menghapus");
            }
        }
    };

    const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Jadwal Mengajar</h1>
                    <p className="text-slate-500 mt-1 text-sm bg-white inline-block">Kelola jadwal kelas / penugasan guru</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Tambah Jadwal
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
                    <select
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-medium"
                    >
                        <option value="">Semua Guru</option>
                        {usersList.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <select
                        value={dayFilter}
                        onChange={(e) => setDayFilter(e.target.value)}
                        className="flex-1 sm:max-w-xs bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-medium"
                    >
                        <option value="">Semua Hari</option>
                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                {/* Table/List */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold border-b border-slate-100">Hari & Waktu</th>
                                <th className="p-4 font-bold border-b border-slate-100">Guru</th>
                                <th className="p-4 font-bold border-b border-slate-100">Ruang/Kelas</th>
                                <th className="p-4 font-bold border-b border-slate-100 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" /></td></tr>
                            ) : schedules.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-400 text-sm">Tidak ada jadwal ditemukan</td></tr>
                            ) : (
                                schedules.map((sched) => (
                                    <tr key={sched.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4 border-b border-slate-50">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                                <Calendar className="w-4 h-4 text-indigo-500" /> {sched.day}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
                                                <Clock className="w-3.5 h-3.5" /> {sched.start_time.substring(0, 5)} - {sched.end_time.substring(0, 5)}
                                            </div>
                                        </td>
                                        <td className="p-4 border-b border-slate-50">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                                <UserIcon className="w-4 h-4 text-slate-400" /> {sched.user.name}
                                            </div>
                                            <p className="text-xs text-slate-400 mt-0.5 ml-6">{sched.user.nip}</p>
                                        </td>
                                        <td className="p-4 border-b border-slate-50">
                                            <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg inline-flex">
                                                <MapPin className="w-4 h-4" /> {sched.room.name}
                                            </div>
                                        </td>
                                        <td className="p-4 border-b border-slate-50 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEditModal(sched)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(sched.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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

                {/* Pagination Info */}
                {!loading && schedules.length > 0 && (
                    <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
                        <p>Menampilkan {(pagination.current_page - 1) * pagination.per_page + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} data</p>
                        <div className="flex gap-2">
                            <button disabled={pagination.current_page === 1} onClick={() => fetchSchedules(pagination.current_page - 1)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50">Prev</button>
                            <button disabled={pagination.current_page === pagination.last_page} onClick={() => fetchSchedules(pagination.current_page + 1)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal CRUD */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slideDown">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800">{modalMode === 'create' ? 'Tambah Jadwal Baru' : 'Edit Jadwal'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{errorMsg}</div>}

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Guru Pengajar</label>
                                <select required value={formData.user_id} onChange={e => setFormData({ ...formData, user_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-600">
                                    <option value="" disabled>Pilih Guru</option>
                                    {usersList.map((u: any) => <option key={u.id} value={u.id}>{u.name} ({u.nip})</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Ruang / Kelas</label>
                                    <select required value={formData.room_id} onChange={e => setFormData({ ...formData, room_id: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-600">
                                        <option value="" disabled>Pilih Ruang</option>
                                        {roomsList.map((r: any) => <option key={r.id} value={r.id}>{r.room_name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Hari</label>
                                    <select required value={formData.day} onChange={e => setFormData({ ...formData, day: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-600">
                                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Jam Mulai</label>
                                    <input required type="time" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-600" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Jam Selesai</label>
                                    <input required type="time" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-600" />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-colors">Batal</button>
                                <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Jadwal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
