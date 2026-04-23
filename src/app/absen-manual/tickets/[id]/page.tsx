"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getTicketDetail,
  respondToTicket,
  closeTicket,
} from "@/services/helpDeskService";
import Alert from "@/components/Alert";

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = parseInt(params.id as string);

  const [ticket, setTicket] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  const [responseMessage, setResponseMessage] = useState("");
  const [showClosingDialog, setShowClosingDialog] = useState(false);

  useEffect(() => {
    fetchTicketDetail();
    const interval = setInterval(fetchTicketDetail, 5000); // Refresh setiap 5 detik
    return () => clearInterval(interval);
  }, []);

  const fetchTicketDetail = async () => {
    try {
      const result = await getTicketDetail(ticketId);
      setTicket(result.data.ticket);
      setResponses(result.data.responses || []);
    } catch (error: any) {
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Gagal memuat detail tiket",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!responseMessage.trim()) {
      setAlert({
        type: "warning",
        message: "Mohon isi pesan terlebih dahulu",
      });
      return;
    }

    try {
      setSubmitting(true);
      const result = await respondToTicket(ticketId, responseMessage);

      setAlert({
        type: "success",
        message: "Respons berhasil ditambahkan",
      });

      setResponseMessage("");
      fetchTicketDetail();
    } catch (error: any) {
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Gagal mengirim respons",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async () => {
    try {
      setSubmitting(true);
      const result = await closeTicket(ticketId);

      setAlert({
        type: "success",
        message: "Tiket berhasil ditutup",
      });

      setShowClosingDialog(false);
      fetchTicketDetail();
    } catch (error: any) {
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Gagal menutup tiket",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-gray-500">Memuat detail tiket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-gray-500 mb-4">Tiket tidak ditemukan</p>
          <Link
            href="/absen-manual/tickets"
            className="text-blue-600 hover:text-blue-800"
          >
            Kembali ke Daftar Tiket
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-800";
      case "In-progress":
        return "bg-yellow-100 text-yellow-800";
      case "Closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Mid":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/absen-manual/tickets"
            className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Kembali ke Daftar Tiket
          </Link>
        </div>

        {/* Alert */}
        {alert && (
          <div className="mb-6">
            <Alert type={alert.type} message={alert.message} />
          </div>
        )}

        {/* Ticket Card */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            {/* Title & Status */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {ticket.subject}
                </h1>
                <p className="text-sm text-gray-500 mt-2">Tiket #{ticket.id}</p>
              </div>
              <div className="flex gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}
                >
                  {ticket.status}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(ticket.priority)}`}
                >
                  {ticket.priority}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded p-4 mb-4">
              <p className="text-gray-700 whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Dibuat</p>
                <p className="font-medium">
                  {new Date(ticket.created_at).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {ticket.first_response_at && (
                <div>
                  <p className="text-gray-500">Respons Pertama</p>
                  <p className="font-medium">
                    {new Date(ticket.first_response_at).toLocaleDateString(
                      "id-ID",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                </div>
              )}
              {ticket.resolved_at && (
                <div>
                  <p className="text-gray-500">Diselesaikan</p>
                  <p className="font-medium">
                    {new Date(ticket.resolved_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
              {ticket.operator && (
                <div>
                  <p className="text-gray-500">Admin</p>
                  <p className="font-medium">{ticket.operator.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Responses */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Percakapan ({responses.length})
            </h2>
          </div>

          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {responses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Belum ada respons
              </p>
            ) : (
              responses.map((response) => (
                <div
                  key={response.id}
                  className={`p-4 rounded-lg ${
                    response.is_auto_reply
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {response.responder?.name || "Unknown"}
                      </p>
                      {response.is_auto_reply && (
                        <p className="text-xs text-blue-600">🤖 Auto Reply</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(response.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {response.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Response Form - only show if ticket is not closed */}
        {ticket.status !== "Closed" && (
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Balas Tiket
              </h2>
            </div>

            <form onSubmit={handleRespond} className="p-6 space-y-4">
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Tulis respons Anda di sini..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Mengirim..." : "Kirim Respons"}
                </button>

                {ticket.status !== "Closed" && (
                  <button
                    type="button"
                    onClick={() => setShowClosingDialog(true)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Tutup Tiket
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Closing Dialog */}
        {showClosingDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
              <h2 className="text-lg font-semibold mb-4">Tutup Tiket?</h2>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menutup tiket ini? Anda masih bisa
                membuka kembali jika diperlukan.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowClosingDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleClose}
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting ? "Menutup..." : "Ya, Tutup Tiket"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
