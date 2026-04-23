"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getTicketDetailAdmin,
  updateTicket,
  respondAsAdmin,
  getAutoReplySuggestions,
} from "@/services/helpDeskService";
import Alert from "@/components/Alert";

export default function AdminTicketDetailPage() {
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
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [updateForm, setUpdateForm] = useState({
    status: "",
    priority: "",
  });

  useEffect(() => {
    fetchTicketDetail();
  }, []);

  const fetchTicketDetail = async () => {
    try {
      const result = await getTicketDetailAdmin(ticketId);
      setTicket(result.data.ticket);
      setResponses(result.data.responses || []);
      setUpdateForm({
        status: result.data.ticket.status,
        priority: result.data.ticket.priority,
      });

      // Fetch suggestions
      await fetchSuggestions();
    } catch (error: any) {
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Gagal memuat detail tiket",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const result = await getAutoReplySuggestions(ticketId);
      setSuggestions(result.data?.suggestions || []);
    } catch (error) {
      // Ignore suggestion errors
    }
  };

  const handleUpdateTicket = async () => {
    try {
      setSubmitting(true);
      const result = await updateTicket(ticketId, {
        status: updateForm.status,
        priority: updateForm.priority,
      });

      setAlert({
        type: "success",
        message: "Tiket berhasil diperbarui",
      });

      setTicket(result.data);
    } catch (error: any) {
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Gagal memperbarui tiket",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async (
    e: React.FormEvent,
    useAutoReply: boolean = false,
  ) => {
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
      const result = await respondAsAdmin(
        ticketId,
        responseMessage,
        useAutoReply,
      );

      setAlert({
        type: "success",
        message: "Respons berhasil ditambahkan",
      });

      setResponseMessage("");
      setShowSuggestions(false);
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

  const useSuggestion = (suggestion: any) => {
    setResponseMessage(suggestion.content);
    setShowSuggestions(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center py-12">
          <p className="text-gray-500">Memuat detail tiket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center py-12">
          <p className="text-gray-500 mb-4">Tiket tidak ditemukan</p>
          <Link
            href="/admin/helpdesk"
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/helpdesk"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Card */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {ticket.subject}
                    </h1>
                    <p className="text-sm text-gray-500 mt-2">
                      Tiket #{ticket.id}
                    </p>
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

                <div className="bg-gray-50 rounded p-4 mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {ticket.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Pelapor</p>
                    <p className="font-medium">
                      {ticket.reporter?.name || "Unknown"}
                    </p>
                  </div>
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
                </div>
              </div>
            </div>

            {/* Responses */}
            <div className="bg-white rounded-lg shadow">
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
                            <p className="text-xs text-blue-600">
                              🤖 Auto Reply
                            </p>
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
                      <p className="text-gray-700 whitespace-pre-wrap text-sm">
                        {response.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Response Form */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Balas Tiket
                </h2>
              </div>

              <form
                onSubmit={(e) => handleRespond(e, false)}
                className="p-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pesan Respons
                  </label>
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Tulis respons Anda di sini..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowSuggestions(!showSuggestions)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {showSuggestions ? "▼ Sembunyikan" : "▶ Lihat"} Saran
                      Jawaban ({suggestions.length})
                    </button>

                    {showSuggestions && (
                      <div className="mt-3 space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        {suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => useSuggestion(suggestion)}
                            className="block w-full text-left p-2 bg-white rounded border border-blue-200 hover:border-blue-400 hover:bg-blue-50"
                          >
                            <p className="font-medium text-sm text-gray-900">
                              {suggestion.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {suggestion.content}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? "Mengirim..." : "Kirim Respons"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Update Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Update Tiket
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={updateForm.status}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Open">Open</option>
                    <option value="In-progress">In-progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioritas
                  </label>
                  <select
                    value={updateForm.priority}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Low">Rendah</option>
                    <option value="Mid">Sedang</option>
                    <option value="High">Tinggi</option>
                  </select>
                </div>

                <button
                  onClick={handleUpdateTicket}
                  disabled={submitting}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>

            {/* SLA Info */}
            {ticket.first_response_at && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  SLA Tracking
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-500">Respons Pertama</p>
                    <p className="font-medium">
                      {new Date(ticket.first_response_at).toLocaleDateString(
                        "id-ID",
                      )}
                    </p>
                  </div>
                  {ticket.resolved_at && (
                    <div>
                      <p className="text-gray-500">Diselesaikan</p>
                      <p className="font-medium">
                        {new Date(ticket.resolved_at).toLocaleDateString(
                          "id-ID",
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
