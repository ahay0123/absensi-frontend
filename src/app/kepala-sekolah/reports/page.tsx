"use client";
import React, { useEffect, useState } from "react";
import KepsekLayout from "@/components/KepsekLayout";
import { Loader2, FileDown, FileText, Calendar, CheckCircle, Clock, Search, XCircle, AlertCircle } from "lucide-react";
import api from "@/lib/axios";

export default function KepsekReports() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<any>(null);

    // Filters
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [month, setMonth] = useState(currentMonth.toString());
    const [year, setYear] = useState(currentYear.toString());
    const [search, setSearch] = useState("");

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/kepsek/reports?month=${month}&year=${year}`);
            setReports(res.data.data);
            setPeriod(res.data.period);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [month, year]);

    const filteredReports = reports.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.nip.includes(search)
    );

    const handleExportExcel = async () => {
        try {
            const res = await api.get(`/kepsek/reports/export-excel?month=${month}&year=${year}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `laporan_absensi_${year}_${month}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (err) {
            alert('Gagal mengekspor data laporan ke Excel/CSV');
        }
    };

    const handleExportPdf = async () => {
        try {
            const res = await api.get(`/kepsek/reports/export-pdf?month=${month}&year=${year}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `laporan_absensi_${year}_${month}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (err) {
            alert('Gagal mengekspor data laporan ke PDF');
        }
    };

    const months = [
        { value: "1", label: "Januari" }, { value: "2", label: "Februari" },
        { value: "3", label: "Maret" }, { value: "4", label: "April" },
        { value: "5", label: "Mei" }, { value: "6", label: "Juni" },
        { value: "7", label: "Juli" }, { value: "8", label: "Agustus" },
        { value: "9", label: "September" }, { value: "10", label: "Oktober" },
        { value: "11", label: "November" }, { value: "12", label: "Desember" }
    ];

    const years = Array.from(new Array(5), (val, index) => currentYear - index);

    return (
        <KepsekLayout>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Laporan Absensi</h1>
                    <p className="text-slate-500 mt-1 text-sm bg-white inline-block">Rekapitulasi kehadiran guru per bulan</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleExportExcel}
                        className="flex-1 sm:flex-none border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                    >
                        <FileDown className="w-5 h-5" /> Export Excel
                    </button>
                    <button
                        onClick={handleExportPdf}
                        className="flex-1 sm:flex-none border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                    >
                        <FileText className="w-5 h-5" /> Export PDF
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Toolbar Filters */}
                <div className="p-5 border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau NIP guru..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-600 text-sm shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-slate-400" />
                        <select
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-medium shadow-sm"
                        >
                            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-medium shadow-sm"
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                {/* Info Badge */}
                {!loading && period && (
                    <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
                        <p className="text-sm font-bold text-indigo-800">Menampilkan Laporan Periode: {period.month_name} {period.year}</p>
                        <span className="text-xs font-bold bg-indigo-200/50 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-wider">{filteredReports.length} Guru</span>
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold border-b border-slate-100">Nama Guru / NIP</th>
                                <th className="p-4 font-bold border-b border-slate-100 text-center"><span title="Hadir"><CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" /></span></th>
                                <th className="p-4 font-bold border-b border-slate-100 text-center"><span title="Terlambat"><Clock className="w-4 h-4 text-amber-500 mx-auto" /></span></th>
                                <th className="p-4 font-bold border-b border-slate-100 text-center"><span title="Izin/Sakit"><AlertCircle className="w-4 h-4 text-blue-500 mx-auto" /></span></th>
                                <th className="p-4 font-bold border-b border-slate-100 text-center"><span title="Alpa"><XCircle className="w-4 h-4 text-red-500 mx-auto" /></span></th>
                                <th className="p-4 font-bold border-b border-slate-100 text-center">Total</th>
                                <th className="p-4 font-bold border-b border-slate-100 text-right">% Kehadiran</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" /></td></tr>
                            ) : filteredReports.length === 0 ? (
                                <tr><td colSpan={7} className="p-12 text-center text-slate-400 text-sm">Tidak ada data laporan absensi pada periode ini.</td></tr>
                            ) : (
                                filteredReports.map((report) => (
                                    <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 border-b border-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500 font-bold text-xs uppercase">
                                                    {report.name.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{report.name}</p>
                                                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">{report.nip}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 border-b border-slate-50 text-center text-sm font-bold text-emerald-700 bg-emerald-50/30">{report.hadir}</td>
                                        <td className="p-4 border-b border-slate-50 text-center text-sm font-bold text-amber-700 bg-amber-50/30">{report.terlambat}</td>
                                        <td className="p-4 border-b border-slate-50 text-center text-sm font-bold text-blue-700 bg-blue-50/30">{report.izin}</td>
                                        <td className="p-4 border-b border-slate-50 text-center text-sm font-bold text-red-700 bg-red-50/30">{report.alpa}</td>
                                        <td className="p-4 border-b border-slate-50 text-center text-sm font-black text-slate-700">{report.total}</td>
                                        <td className="p-4 border-b border-slate-50 text-right">
                                            <span className={`inline-block px-3 py-1 rounded-lg text-sm font-black ${report.persentase >= 90 ? 'bg-emerald-100 text-emerald-700' :
                                                report.persentase >= 75 ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {report.persentase}%
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </KepsekLayout>
    );
}
