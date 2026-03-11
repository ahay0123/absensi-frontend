"use client";
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Calendar,
  Loader2,
  Download,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import Alert, { useAlert } from "@/components/Alert";

interface ManualAttendance {
  id: number;
  user: { id: number; name: string };
  schedule: {
    id: number;
    subject: string;
    room: { name: string };
    start_time: string;
    end_time: string;
  };
  attendance_date: string;
  reason: string;
  proof_url: string | null;
  status: "Pending" | "Approved" | "Rejected";
  created_at: string;
  rejection_reason?: string;
}

export default function AbsenManualPage() {
  const [requests, setRequests] = useState<ManualAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const { alert, showAlert, hideAlert } = useAlert();

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `/kepsek/manual-attendances?status=${statusFilter}`,
        );
        setRequests(res.data.data || []);
      } catch (err) {
        console.error(err);
        showAlert("error", "Gagal memuat data pengajuan absensi manual");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [statusFilter]);

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      const response = await api.post(
        `/kepsek/manual-attendances/${id}/approve`,
      );
      if (response.data.success) {
        showAlert("success", response.data.message);
        // Remove from list
        setRequests(requests.filter((r) => r.id !== id));
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Gagal menyetujui pengajuan";
      showAlert("error", errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (id: number) => {
    setRejectingId(id);
    setRejectionReason("");
  };

  const handleRejectSubmit = async (id: number) => {
    if (!rejectionReason.trim() || rejectionReason.length < 5) {
      showAlert("error", "Alasan penolakan minimal 5 karakter");
      return;
    }

    setProcessingId(id);
    try {
      const response = await api.post(
        `/kepsek/manual-attendances/${id}/reject`,
        {
          rejection_reason: rejectionReason,
        },
      );
      if (response.data.success) {
        showAlert("success", response.data.message);
        // Remove from list
        setRequests(requests.filter((r) => r.id !== id));
        setRejectingId(null);
        setRejectionReason("");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Gagal menolak pengajuan";
      showAlert("error", errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={hideAlert} />
      )}

      {/* Header */}
      <div className="bg-white p-6 pt-12 rounded-b-[2.5rem] shadow-sm relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/kepala-sekolah"
            className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Pengajuan Absensi Manual
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Kelola pengajuan absensi manual dari guru
            </p>
          </div>
        </div>

        {/* Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-bold text-slate-600"
        >
          <option value="Pending">Menunggu Persetujuan</option>
          <option value="Approved">Disetujui</option>
          <option value="Rejected">Ditolak</option>
          <option value="">Semua Status</option>
        </select>
      </div>

      {/* List Pengajuan */}
      <div className="p-6 space-y-4">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Tidak ada pengajuan absensi manual.
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full mb-2 uppercase tracking-wide">
                      {req.user.name}
                    </span>
                    <h3 className="font-bold text-slate-800 text-sm">
                      {req.schedule.subject} - {req.schedule.room.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {req.schedule.start_time.substring(0, 5)} -{" "}
                      {req.schedule.end_time.substring(0, 5)} |{" "}
                      {new Date(req.attendance_date).toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      req.status === "Pending"
                        ? "bg-amber-50 text-amber-600"
                        : req.status === "Approved"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600"
                    }`}
                  >
                    {req.status === "Pending" && (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    {req.status === "Approved" && (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                    {req.status === "Rejected" && (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    {req.status === "Pending"
                      ? "Perlu Review"
                      : req.status === "Approved"
                        ? "Disetujui"
                        : "Ditolak"}
                  </div>
                </div>

                {/* Reason */}
                <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                  <p className="text-xs font-bold text-slate-500 mb-1">
                    Alasan / Keterangan
                  </p>
                  <p className="text-sm text-slate-700 font-medium">
                    {req.reason}
                  </p>
                </div>

                {/* Rejection Reason (if rejected) */}
                {req.status === "Rejected" && req.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-red-600 mb-1">
                        Alasan Penolakan
                      </p>
                      <p className="text-sm text-red-700">
                        {req.rejection_reason}
                      </p>
                    </div>
                  </div>
                )}

                {/* Proof Document */}
                {req.proof_url && (
                  <a
                    href={`/${req.proof_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors mb-4"
                  >
                    <Download className="w-4 h-4" /> Lihat Dokumen Lampiran
                  </a>
                )}

                {/* Action Buttons (only for Pending) */}
                {req.status === "Pending" && (
                  <>
                    {rejectingId === req.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Jelaskan alasan penolakan (minimal 5 karakter)"
                          rows={3}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setRejectingId(null)}
                            className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => handleRejectSubmit(req.id)}
                            disabled={
                              processingId === req.id ||
                              rejectionReason.length < 5
                            }
                            className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-xs font-bold rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-1"
                          >
                            {processingId === req.id ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />{" "}
                                Menolak...
                              </>
                            ) : (
                              <>Tolak</>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(req.id)}
                          disabled={processingId === req.id}
                          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-sm font-bold rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {processingId === req.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />{" "}
                              Menyetujui...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" /> Setujui
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleRejectClick(req.id)}
                          className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" /> Tolak
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
