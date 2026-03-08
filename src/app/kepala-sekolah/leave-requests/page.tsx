"use client";
import React, { useEffect, useState } from "react";
import KepsekLayout from "@/components/KepsekLayout";
import { Search, Loader2, CheckCircle, XCircle, FileText, User as UserIcon, Calendar, Clock, Image as ImageIcon } from "lucide-react";
import api from "@/lib/axios";

export default function KepsekLeaveRequests() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");
    const [statusFilter, setStatusFilter] = useState("Pending"); // Default to pending
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState<any>({});

    const [processingId, setProcessingId] = useState<number | null>(null);

    const fetchRequests = async (page = 1) => {
        setLoading(true);
        try {
            const res = await api.get(`/kepsek/leave-requests?page=${page}&start_date=${dateStart}&end_date=${dateEnd}&status=${statusFilter}&search=${search}`);
            setRequests(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [dateStart, dateEnd, statusFilter, search]);

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        if (confirm(`Yakin ingin ${action === 'approve' ? 'Menyetujui' : 'Menolak'} pengajuan ini?`)) {
            setProcessingId(id);
            try {
                await api.post(`/kepsek/leave-requests/${id}/${action}`);
                fetchRequests(pagination.current_page);
            } catch (err: any) {
                alert(err.response?.data?.message || "Gagal memproses");
            } finally {
                setProcessingId(null);
            }
        }
    };

    const [viewProof, setViewProof] = useState<string | null>(null);

    return (
        <KepsekLayout>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Pengajuan Izin</h1>
                    <p className="text-slate-500 mt-1 text-sm bg-white inline-block">Kelola pengajuan izin dan sakit dari guru</p>
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
                        <option value="Pending">Menunggu Persetujuan</option>
                        <option value="Approved">Disetujui</option>
                        <option value="Rejected">Ditolak</option>
                    </select>
                </div>

                {/* List view for leaves as cards for better readability of reasons/proofs */}
                <div className="p-4 space-y-4 bg-slate-50/50">
                    {loading ? (
                        <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
                    ) : requests.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">Tidak ada pengajuan ditemukan</div>
                    ) : (
                        requests.map((req) => (
                            <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6">

                                {/* User Info */}
                                <div className="md:w-64 shrink-0 flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                        <UserIcon className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{req.user.name}</h3>
                                        <p className="text-xs text-slate-500 mt-1">{req.user.nip}</p>
                                        <div className="mt-2 text-xs font-bold uppercase tracking-wider inline-block px-2 py-1 rounded bg-slate-100 text-slate-600">
                                            Surat {req.type}
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-4 text-sm font-bold text-slate-800">
                                        <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-indigo-500" /> {req.start_date}</div>
                                        <span className="text-slate-300">s/d</span>
                                        <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-indigo-500" /> {req.end_date}</div>
                                    </div>

                                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                                        <p className="text-xs font-bold text-amber-700 uppercase mb-1">Alasan</p>
                                        <p className="text-sm text-amber-900">{req.reason}</p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" /> Diajukan: {req.created_at_formatted}
                                        </p>

                                        {/* Proof Button */}
                                        {req.proof_url && (
                                            <button onClick={() => setViewProof(req.proof_url)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                                                <ImageIcon className="w-3.5 h-3.5" /> Lihat Bukti Lampiran
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Actions / Status */}
                                <div className="md:w-48 shrink-0 flex flex-col items-end justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 pl-0 md:pl-6">
                                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${req.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                        req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {req.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                                        {req.status === 'Approved' && <CheckCircle className="w-3.5 h-3.5" />}
                                        {req.status === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                                        {req.status === 'Pending' ? 'Menunggu Review' : req.status === 'Approved' ? 'Disetujui' : 'Ditolak'}
                                    </div>

                                    {req.status === 'Pending' && (
                                        <div className="flex gap-2 w-full mt-4">
                                            <button
                                                disabled={processingId === req.id}
                                                onClick={() => handleAction(req.id, 'reject')}
                                                className="flex-1 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl disabled:opacity-50 transition-colors"
                                            >
                                                Tolak
                                            </button>
                                            <button
                                                disabled={processingId === req.id}
                                                onClick={() => handleAction(req.id, 'approve')}
                                                className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 rounded-xl disabled:opacity-50 transition-colors"
                                            >
                                                {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Setujui'}
                                            </button>
                                        </div>
                                    )}
                                    {req.status !== 'Pending' && (
                                        <div className="mt-4 text-xs font-medium text-slate-400 text-right">
                                            Oleh: {req.processed_by_user?.name || '-'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination Info */}
                {!loading && requests.length > 0 && (
                    <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
                        <p>Data {pagination.from} - {pagination.to} dari total {pagination.total}</p>
                        <div className="flex gap-2">
                            <button disabled={pagination.current_page === 1} onClick={() => fetchRequests(pagination.current_page - 1)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50">Prev</button>
                            <button disabled={pagination.current_page === pagination.last_page} onClick={() => fetchRequests(pagination.current_page + 1)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Proof Image Modal */}
            {viewProof && (
                <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setViewProof(null)}>
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800">Bukti Lampiran Izin</h3>
                            <button onClick={() => setViewProof(null)} className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 bg-slate-50 flex justify-center">
                            <img src={viewProof} alt="Bukti Izin" className="max-w-full max-h-[70vh] object-contain rounded-xl border border-slate-200 shadow-sm" />
                        </div>
                        <div className="p-4 border-t border-slate-100 text-center">
                            <a href={viewProof} target="_blank" rel="noreferrer" className="text-sm font-bold text-indigo-600 hover:underline">Buka Gambar di Tab Baru</a>
                        </div>
                    </div>
                </div>
            )}
        </KepsekLayout>
    );
}
