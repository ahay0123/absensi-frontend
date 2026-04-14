"use client";
import React, { useEffect, useState } from "react";
import KepsekLayout from "@/components/KepsekLayout";
import {
    FileText, Loader2, Calendar, Users, Briefcase,
    CheckCircle, Clock, XCircle, AlertCircle, TrendingUp,
    TrendingDown, AlertTriangle
} from "lucide-react";
import api from "@/lib/axios";
import Link from "next/link";

export default function KepsekDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get("/kepsek/dashboard");
                setData(res.data.data);
            } catch (err: any) {
                console.error("Failed to fetch dashboard", err);
                setError("Gagal memuat data dashboard.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <KepsekLayout>
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        </KepsekLayout>
    );

    if (error) return (
        <KepsekLayout>
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">{error}</p>
                </div>
            </div>
        </KepsekLayout>
    );

    // Hitung persentase kehadiran hari ini
    const todayTotal = Object.values(data?.attendance_today || {}).reduce((a: any, b: any) => a + b, 0) as number;
    const todayHadir = (data?.attendance_today?.Hadir || 0) + (data?.attendance_today?.Terlambat || 0);
    const todayPct = todayTotal > 0 ? Math.round((todayHadir / todayTotal) * 100) : 0;

    return (
        <KepsekLayout>
            {/* ── Header ── */}
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-800">Selamat Datang, Kepala Sekolah</h1>
                <p className="text-slate-500 mt-1 text-sm">
                    Sistem Informasi Presensi Guru &amp; Tenaga Kependidikan
                    {data?.period && (
                        <span className="ml-2 inline-block bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">
                            {data.period.month_name} {data.period.year}
                        </span>
                    )}
                </p>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total Guru */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Guru</p>
                        <h3 className="text-2xl font-black text-slate-800">{data?.total_guru || 0}</h3>
                    </div>
                </div>

                {/* Hadir Hari Ini */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Hadir Hari Ini</p>
                        <h3 className="text-2xl font-black text-slate-800">{data?.guru_hadir_hari_ini || 0}</h3>
                        <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                            dari {data?.total_guru || 0} guru
                        </p>
                    </div>
                </div>

                {/* Jadwal Hari Ini */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Jadwal Hari Ini</p>
                        <h3 className="text-2xl font-black text-slate-800">{data?.jadwal_hari_ini || 0}</h3>
                        <p className="text-[10px] text-blue-600 font-bold mt-0.5">sesi kelas</p>
                    </div>
                </div>

                {/* Izin Pending */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Izin Menunggu</p>
                        <h3 className="text-2xl font-black text-slate-800">{data?.pending_leaves || 0}</h3>
                        <p className="text-[10px] text-amber-600 font-bold mt-0.5">belum direspon</p>
                    </div>
                </div>
            </div>

            {/* ── Rekap Hari Ini + Trend 7 Hari ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Rekap Status Absensi Hari Ini */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="font-bold text-lg text-slate-800">Rekap Absensi Hari Ini</h2>
                        <span className={`text-xs font-black px-3 py-1 rounded-full ${todayPct >= 80 ? 'bg-emerald-100 text-emerald-700' : todayPct >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {todayPct}% Hadir
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
                            <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
                            <h4 className="font-black text-xl text-emerald-700">{data?.attendance_today?.Hadir || 0}</h4>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase mt-0.5">Hadir Tepat</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center">
                            <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
                            <h4 className="font-black text-xl text-amber-700">{data?.attendance_today?.Terlambat || 0}</h4>
                            <p className="text-[10px] font-bold text-amber-600 uppercase mt-0.5">Terlambat</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-center">
                            <AlertCircle className="w-5 h-5 text-blue-500 mx-auto mb-1.5" />
                            <h4 className="font-black text-xl text-blue-700">{data?.attendance_today?.Izin || 0}</h4>
                            <p className="text-[10px] font-bold text-blue-600 uppercase mt-0.5">Izin / Sakit</p>
                        </div>
                        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-center">
                            <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1.5" />
                            <h4 className="font-black text-xl text-red-700">{data?.attendance_today?.Alpa || 0}</h4>
                            <p className="text-[10px] font-bold text-red-600 uppercase mt-0.5">Alpa</p>
                        </div>
                    </div>
                </div>

                {/* Trend 7 Hari Terakhir */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="font-bold text-lg text-slate-800">Trend 7 Hari Terakhir</h2>
                        <TrendingUp className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="space-y-2.5">
                        {(data?.trend_7_days || []).map((day: any, i: number) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-slate-400 w-20 shrink-0">{day.day_label}</span>
                                <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${day.persentase >= 80 ? 'bg-emerald-500' : day.persentase >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                                        style={{ width: `${day.persentase}%` }}
                                    />
                                </div>
                                <span className={`text-[10px] font-black w-10 text-right ${day.persentase >= 80 ? 'text-emerald-600' : day.persentase >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                                    {day.persentase}%
                                </span>
                            </div>
                        ))}
                        {(!data?.trend_7_days || data.trend_7_days.length === 0) && (
                            <p className="text-sm text-slate-400 text-center py-4">Belum ada data trend</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Guru Kehadiran Terendah + Izin Pending ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* 5 Guru Kehadiran Terendah */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="font-bold text-lg text-slate-800">Kehadiran Terendah</h2>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">
                            <TrendingDown className="w-3 h-3" /> Bulan Ini
                        </div>
                    </div>
                    <div className="space-y-3">
                        {(data?.guru_terendah || []).length > 0 ? (
                            data.guru_terendah.map((guru: any, i: number) => (
                                <div key={guru.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-all">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black ${i === 0 ? 'bg-red-100 text-red-600' : i === 1 ? 'bg-orange-100 text-orange-600' : 'bg-amber-100 text-amber-600'}`}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{guru.name}</p>
                                        <p className="text-[10px] text-slate-400">{guru.nip}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className={`text-sm font-black ${guru.persentase >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                                            {guru.persentase}%
                                        </span>
                                        <p className="text-[10px] text-slate-400">{guru.hadir + guru.terlambat}/{guru.total} sesi</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400 text-center py-6">Belum ada data bulan ini</p>
                        )}
                    </div>
                </div>

                {/* Izin Terbaru yang Pending */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="font-bold text-lg text-slate-800">Izin Menunggu Proses</h2>
                        {(data?.pending_leaves || 0) > 0 && (
                            <span className="text-xs font-black bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                                {data.pending_leaves} Pending
                            </span>
                        )}
                    </div>
                    <div className="space-y-3">
                        {(data?.recent_leaves || []).length > 0 ? (
                            data.recent_leaves.map((leave: any) => (
                                <div key={leave.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                                    <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{leave.user_name}</p>
                                        <p className="text-[10px] text-slate-400">{leave.type} • {leave.start_date} s/d {leave.end_date}</p>
                                        <p className="text-[10px] text-slate-300 mt-0.5">Diajukan {leave.created_at}</p>
                                    </div>
                                    <div className="bg-amber-50 border border-amber-100 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                        Pending
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6">
                                <CheckCircle className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                                <p className="text-sm text-slate-400">Tidak ada izin yang menunggu</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── CTA Laporan ── */}
            <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-black mb-2">Laporan Absensi Bulanan</h2>
                        <p className="text-indigo-100 text-sm max-w-md">
                            Laporan rekapan absensi semua guru kini bisa diunduh dalam bentuk cetak Excel maupun PDF langsung melalui sistem.
                        </p>
                    </div>
                    <div className="shrink-0">
                        <Link href="/kepala-sekolah/reports" className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-slate-50 active:scale-95 transition-all inline-flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Buka Menu Laporan
                        </Link>
                    </div>
                </div>
                {/* Decorative */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/50 rounded-full blur-3xl mix-blend-multiply" />
                <div className="absolute -bottom-24 left-10 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl mix-blend-multiply" />
            </div>
        </KepsekLayout>
    );
}
