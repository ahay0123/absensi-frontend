"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTicket, checkDuplicates } from "@/services/helpDeskService";
import Alert from "@/components/Alert";

interface SimilarTicket {
  ticket_id: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  subject_similarity: number;
  description_similarity: number;
  average_similarity: number;
}

export default function CreateTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "Low",
  });

  const [similarTickets, setSimilarTickets] = useState<SimilarTicket[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [checkedForDuplicates, setCheckedForDuplicates] = useState(false);

  // Check untuk tiket serupa
  const handleCheckDuplicates = async () => {
    if (!formData.subject.trim() || !formData.description.trim()) {
      setAlert({
        type: "warning",
        message: "Mohon isi subject dan description terlebih dahulu",
      });
      return;
    }

    try {
      setLoading(true);
      const result = await checkDuplicates({
        subject: formData.subject,
        description: formData.description,
      });

      setSimilarTickets(result.similar_tickets || []);
      setShowDuplicateWarning(result.has_possible_duplicate);
      setCheckedForDuplicates(true);

      if (result.has_possible_duplicate) {
        setAlert({
          type: "warning",
          message:
            "Ditemukan tiket serupa! Mohon periksa apakah masalah Anda sudah pernah dilaporkan.",
        });
      } else if (result.similar_tickets?.length > 0) {
        setAlert({
          type: "warning",
          message:
            "Ada beberapa tiket yang mungkin terkait. Mohon periksa di bawah.",
        });
      } else {
        setAlert({
          type: "success",
          message:
            "Tidak ada tiket serupa. Anda bisa melanjutkan pembuatan tiket baru.",
        });
      }
    } catch (error: any) {
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Gagal mengecek tiket serupa",
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit tiket baru
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.description.trim()) {
      setAlert({
        type: "error",
        message: "Subject dan description harus diisi",
      });
      return;
    }

    try {
      setLoading(true);
      const result = await createTicket({
        subject: formData.subject,
        description: formData.description,
        priority: formData.priority,
        check_duplicates: true,
      });

      if (!result.success) {
        // Ada warning duplikasi
        setSimilarTickets(result.similar_tickets || []);
        setShowDuplicateWarning(true);
        setAlert({
          type: "warning",
          message: result.message,
        });
        return;
      }

      setAlert({
        type: "success",
        message: "Tiket berhasil dibuat! Redirecting...",
      });

      // Redirect ke detail tiket
      setTimeout(() => {
        router.push(`/absen-manual/tickets/${result.data.id}`);
      }, 1500);
    } catch (error: any) {
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Gagal membuat tiket",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/absen-manual/tickets"
            className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Kembali ke Daftar Tiket
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Buat Tiket Baru</h1>
          <p className="text-gray-600 mt-2">
            Laporkan masalah atau pertanyaan Anda kepada admin
          </p>
        </div>

        {/* Alert */}
        {alert && (
          <div className="mb-6">
            <Alert type={alert.type} message={alert.message} />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
          <div className="p-6 space-y-6">
            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700"
              >
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                maxLength={255}
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder="Contoh: Masalah Login Aplikasi"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.subject.length}/255 karakter
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Deskripsi Masalah *
              </label>
              <textarea
                id="description"
                rows={5}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Jelaskan masalah atau pertanyaan Anda secara detail..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Minimal 10 karakter</p>
            </div>

            {/* Priority */}
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700"
              >
                Prioritas
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Low">Rendah - Tidak mendesak</option>
                <option value="Mid">Sedang - Butuh penanganan segera</option>
                <option value="High">Tinggi - Sangat mendesak</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Prioritas tinggi akan ditangani lebih cepat
              </p>
            </div>

            {/* Duplicate Check Info */}
            {!checkedForDuplicates && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Sebelum membuat tiket, sistem akan
                  memeriksa apakah ada tiket serupa yang sudah ada. Klik "Cek
                  Tiket Serupa" untuk melihatnya.
                </p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-200 flex gap-3 justify-between">
            <button
              type="button"
              onClick={handleCheckDuplicates}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              🔍 Cek Tiket Serupa
            </button>

            <div className="flex gap-3">
              <Link
                href="/absen-manual/tickets"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading || !checkedForDuplicates}
                className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Membuat..." : "Buat Tiket"}
              </button>
            </div>
          </div>
        </form>

        {/* Similar Tickets Display */}
        {similarTickets.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tiket Serupa ({similarTickets.length})
            </h2>
            <div className="space-y-4">
              {similarTickets.map((ticket) => (
                <Link
                  key={ticket.ticket_id}
                  href={`/absen-manual/tickets/${ticket.ticket_id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {ticket.subject}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex gap-2 mt-2 text-xs">
                        <span
                          className={`px-2 py-1 rounded ${
                            ticket.status === "Closed"
                              ? "bg-gray-100 text-gray-700"
                              : ticket.status === "In-progress"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {ticket.status}
                        </span>
                        <span
                          className={`px-2 py-1 rounded ${
                            ticket.priority === "High"
                              ? "bg-red-100 text-red-700"
                              : ticket.priority === "Mid"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {ticket.average_similarity}% mirip
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(ticket.created_at).toLocaleDateString(
                          "id-ID",
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {showDuplicateWarning && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded">
                <p className="text-sm text-orange-800">
                  ⚠️ Kami menemukan tiket yang sangat mirip. Mohon periksa
                  apakah masalah Anda sudah pernah dilaporkan sebelum membuat
                  tiket baru.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
