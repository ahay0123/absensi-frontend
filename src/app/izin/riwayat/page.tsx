"use client";
import React, { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Clock, CheckCircle, XCircle, Search, Calendar, Loader2, ImageIcon } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";

export default function RiwayatIzinPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            try {
                // Fetch authenticated user's leave requests
                const res = await api.get(`/leave-requests?status=${statusFilter}`);
                setRequests(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [statusFilter]);

    const [viewProof, setViewProof] = useState<string | null>(null);

    return (
        <main className="min-h-screen bg-slate-50 pb-28">
            {/* Header */}
            <div className="bg-white p-6 pt-12 rounded-b-[2.5rem] shadow-sm relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <Link
                        href="/izin"
                        className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Riwayat Izin/Sakit</h1>
                        <p className="text-xs text-slate-400 font-medium">Pengajuan yang telah dikirim</p>
                    </div>
                </div>

                {/* Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-bold text-slate-600"
                >
                    <option value="">Semua Status</option>
                    <option value="Pending">Menunggu Persetujuan</option>
                    <option value="Approved">Disetujui</option>
                    <option value="Rejected">Ditolak</option>
                </select>
            </div>

            {/* List Riwayat */}
            <div className="p-6 space-y-4">
                {loading ? (
                    <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
                ) : requests.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-sm">Belum ada riwayat pengajuan.</div>
                ) : (
                    requests.map((req) => (
                        <div key={req.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full mb-2 uppercase tracking-wide">
                                        Surat {req.type}
                                    </span>
                                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-indigo-500" /> Diajukan: {new Date(req.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </h3>
                                </div>
                                <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${req.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                                    req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                                        'bg-red-50 text-red-600'
                                    }`}>
                                    {req.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                                    {req.status === 'Approved' && <CheckCircle className="w-3.5 h-3.5" />}
                                    {req.status === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                                    {req.status === 'Pending' ? 'Perlu Review' : req.status === 'Approved' ? 'Disetujui' : 'Ditolak'}
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                                <p className="text-xs font-bold text-slate-500 mb-1">Alasan / Keterangan</p>
                                <p className="text-sm text-slate-700 font-medium">{req.reason}</p>
                            </div>

                            {req.proof_url && (
                                <button onClick={() => setViewProof(req.proof_url)} className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                                    <ImageIcon className="w-4 h-4" /> Lihat Dokumen Lampiran
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Modal Bukti Image */}
            {viewProof && (
                <div className="fixed inset-0 bg-slate-900/80 z-[70] flex items-center justify-center p-6 backdrop-blur-sm shadow-2xl" onClick={() => setViewProof(null)}>
                    <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Dokumen Lampiran</h3>
                            <button onClick={() => setViewProof(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 flex justify-center bg-slate-50">
                            <img src={viewProof} alt="Bukti Lampiran" className="max-w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            )}

            <BottomNav />
        </main>
    );
}
