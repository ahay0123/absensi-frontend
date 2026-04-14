"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Plus, Search, Edit2, Trash2, Shield, User as UserIcon, Loader2, X } from "lucide-react";
import api from "@/lib/axios";

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [pagination, setPagination] = useState<any>({});

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [formData, setFormData] = useState({
        id: null, name: "", email: "", nip: "", gender: "bapak", role: "guru", password: "", password_confirmation: ""
    });
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const fetchUsers = async (page = 1) => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/users?page=${page}&search=${search}&role=${roleFilter}`);
            setUsers(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [search, roleFilter]);

    const openCreateModal = () => {
        setModalMode("create");
        setFormData({ id: null, name: "", email: "", nip: "", gender: "bapak", role: "guru", password: "", password_confirmation: "" });
        setErrorMsg("");
        setIsModalOpen(true);
    };

    const openEditModal = (user: any) => {
        setModalMode("edit");
        setFormData({ ...user, password: "", password_confirmation: "" }); // password reset in form
        setErrorMsg("");
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg("");

        try {
            if (modalMode === "create") {
                await api.post("/admin/users", formData);
            } else {
                const payload: any = { ...formData };
                if (!payload.password) {
                    delete payload.password;
                    delete payload.password_confirmation;
                }
                await api.put(`/admin/users/${formData.id}`, payload);
            }
            setIsModalOpen(false);
            fetchUsers(pagination.current_page);
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || "Terjadi kesalahan");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Yakin ingin menghapus pengguna ini?")) {
            try {
                await api.delete(`/admin/users/${id}`);
                fetchUsers(pagination.current_page);
            } catch (err: any) {
                alert(err.response?.data?.message || "Gagal menghapus");
            }
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Data Pengguna</h1>
                    <p className="text-slate-500 mt-1 text-sm bg-white inline-block">Kelola seluruh data guru dan admin</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Tambah Pengguna
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama, NIP, email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-sm"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-medium w-full sm:w-auto"
                    >
                        <option value="">Semua Role</option>
                        <option value="guru">Guru</option>
                        <option value="admin">Admin</option>
                        <option value="kepala-sekolah">Kepala Sekolah</option>
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold border-b border-slate-100">Nama Lengkap</th>
                                <th className="p-4 font-bold border-b border-slate-100">NIP</th>
                                <th className="p-4 font-bold border-b border-slate-100">Role</th>
                                <th className="p-4 font-bold border-b border-slate-100">Gender</th>
                                <th className="p-4 font-bold border-b border-slate-100 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" /></td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-400 text-sm">Tidak ada data ditemukan</td></tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4 border-b border-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 overflow-hidden shrink-0">
                                                    <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=e0e7ff&color=4f46e5`} alt={user.name} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                                                    <p className="text-xs text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 border-b border-slate-50 text-sm font-medium text-slate-600">{user.nip}</td>
                                        <td className="p-4 border-b border-slate-50">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                user.role === 'kepala-sekolah' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 border-b border-slate-50 text-sm font-medium text-slate-600 capitalize">
                                            {user.gender === 'bapak' ? 'Laki-laki' : 'Perempuan'}
                                        </td>
                                        <td className="p-4 border-b border-slate-50 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEditModal(user)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
                {!loading && users.length > 0 && (
                    <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
                        <p>Menampilkan {(pagination.current_page - 1) * pagination.per_page + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} data</p>
                        <div className="flex gap-2">
                            <button disabled={pagination.current_page === 1} onClick={() => fetchUsers(pagination.current_page - 1)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50">Prev</button>
                            <button disabled={pagination.current_page === pagination.last_page} onClick={() => fetchUsers(pagination.current_page + 1)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal CRUD */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slideDown">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800">{modalMode === 'create' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{errorMsg}</div>}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Nama Lengkap</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-600" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">NIP</label>
                                    <input required type="text" value={formData.nip} onChange={e => setFormData({ ...formData, nip: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-600" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                                    <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-600" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                                    <select required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-600">
                                        <option value="guru">Guru</option>
                                        <option value="admin">Admin</option>
                                        <option value="kepala-sekolah">Kepala Sekolah</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Gender (Sapaan)</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                                        <input type="radio" name="gender" value="bapak" checked={formData.gender === 'bapak'} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-4 h-4 accent-indigo-600" /> Laki-laki (Bapak)
                                    </label>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                                        <input type="radio" name="gender" value="ibu" checked={formData.gender === 'ibu'} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-4 h-4 accent-indigo-600" /> Perempuan (Ibu)
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-xs text-slate-400 mb-2">{modalMode === 'edit' ? 'Kosongkan jika tidak ingin mengubah password' : 'Atur Password Login'}</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <input type="password" placeholder="Password" required={modalMode === 'create'} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <input type="password" placeholder="Konfirmasi Password" required={modalMode === 'create' || !!formData.password} value={formData.password_confirmation} onChange={e => setFormData({ ...formData, password_confirmation: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-colors">Batal</button>
                                <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
