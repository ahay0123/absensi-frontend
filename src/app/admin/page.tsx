"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Users, MapPin, Calendar, FileText, CheckCircle, Clock, XCircle, UserPlus, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import Link from "next/link";

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get("/admin/dashboard");
                setData(res.data.data);
            } catch (err) {
                console.error("Failed to fetch dashboard", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <AdminLayout>
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-800">Dashboard</h1>
                <p className="text-slate-500 mt-1">Ringkasan data sistem absensi hari ini</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                        <Users className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase">Total Guru</p>
                        <h3 className="text-2xl font-black text-slate-800">{data?.total_guru || 0}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0">
                        <MapPin className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase">Ruang Terdaftar</p>
                        <h3 className="text-2xl font-black text-slate-800">{data?.total_ruang || 0}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
                        <Calendar className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase">Jadwal Hari Ini</p>
                        <h3 className="text-2xl font-black text-slate-800">{data?.jadwal_hari_ini || 0}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                        <FileText className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase">Izin Pending</p>
                        <h3 className="text-2xl font-black text-slate-800">{data?.pending_leaves || 0}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Attendance Summary */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:col-span-2">
                    <h2 className="font-bold text-lg text-slate-800 mb-6">Rekap Absensi Hari Ini</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
                            <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                            <h4 className="font-black text-xl text-emerald-700">{data?.attendance_summary?.Hadir || 0}</h4>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1">Hadir Tepat</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center">
                            <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                            <h4 className="font-black text-xl text-amber-700">{data?.attendance_summary?.Terlambat || 0}</h4>
                            <p className="text-[10px] font-bold text-amber-600 uppercase mt-1">Terlambat</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-center">
                            <UserPlus className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                            <h4 className="font-black text-xl text-blue-700">{data?.attendance_summary?.Izin || 0}</h4>
                            <p className="text-[10px] font-bold text-blue-600 uppercase mt-1">Izin/Sakit</p>
                        </div>
                        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-center">
                            <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                            <h4 className="font-black text-xl text-red-700">{data?.attendance_summary?.Alpa || 0}</h4>
                            <p className="text-[10px] font-bold text-red-600 uppercase mt-1">Alpa</p>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Guru yang sudah absen hari ini</p>
                            <p className="text-xs text-slate-400 mt-1">Hadir atau Terlambat minimal 1 kelas</p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-black text-indigo-600">{data?.guru_hadir_hari_ini || 0}</span>
                            <span className="text-sm font-medium text-slate-400"> / {data?.total_guru || 0} Guru</span>
                        </div>
                    </div>
                </div>

                {/* Recent Leaves */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-lg text-slate-800">Izin Terbaru</h2>
                        <Link href="/admin/leave-requests" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Lihat Semua</Link>
                    </div>

                    <div className="space-y-4">
                        {data?.recent_leaves?.length > 0 ? (
                            data.recent_leaves.map((leave: any) => (
                                <div key={leave.id} className="flex gap-4 items-start p-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${leave.status === 'Pending' ? 'bg-amber-100 text-amber-600' : leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-800 truncate">{leave.user_name}</h4>
                                        <p className="text-xs text-slate-500 truncate">{leave.type} • {leave.created_at}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-slate-400 text-sm">Belum ada pengajuan izin.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
