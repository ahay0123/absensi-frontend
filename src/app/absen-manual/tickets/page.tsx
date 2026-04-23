"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getMyTickets } from "@/services/helpDeskService";
import Alert from "@/components/Alert";

interface Ticket {
  id: number;
  subject: string;
  description: string;
  status: "Open" | "In-progress" | "Closed";
  priority: "Low" | "Mid" | "High";
  created_at: string;
  updated_at: string;
  first_response_at: string | null;
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  // Fetch tikets
  useEffect(() => {
    fetchTickets();
  }, [pagination.currentPage, filters]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const result = await getMyTickets({
        page: pagination.currentPage,
        per_page: pagination.perPage,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        search: filters.search || undefined,
      });

      setTickets(result.data || []);
      setPagination({
        ...pagination,
        currentPage: result.pagination.current_page,
        lastPage: result.pagination.last_page,
        total: result.pagination.total,
      });
    } catch (error: any) {
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Gagal memuat tiket",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open":
        return "🆕";
      case "In-progress":
        return "⏳";
      case "Closed":
        return "✅";
      default:
        return "❓";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tiket Saya</h1>
              <p className="text-gray-600 mt-2">
                Kelola laporan dan pertanyaan Anda kepada admin
              </p>
            </div>
            <Link
              href="/absen-manual/create-ticket"
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700"
            >
              + Buat Tiket Baru
            </Link>
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <div className="mb-6">
            <Alert type={alert.type} message={alert.message} />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => {
                  setFilters({ ...filters, status: e.target.value });
                  setPagination({ ...pagination, currentPage: 1 });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Semua Status</option>
                <option value="Open">Open</option>
                <option value="In-progress">In-progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioritas
              </label>
              <select
                value={filters.priority}
                onChange={(e) => {
                  setFilters({ ...filters, priority: e.target.value });
                  setPagination({ ...pagination, currentPage: 1 });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Semua Prioritas</option>
                <option value="Low">Rendah</option>
                <option value="Mid">Sedang</option>
                <option value="High">Tinggi</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setPagination({ ...pagination, currentPage: 1 });
                }}
                placeholder="Cari subject atau deskripsi..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">Memuat tiket...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">Belum ada tiket</p>
            <Link
              href="/absen-manual/create-ticket"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Buat Tiket Pertama Anda
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/absen-manual/tickets/${ticket.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-md transition"
              >
                <div className="p-6 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">
                        {getStatusIcon(ticket.status)}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {ticket.subject}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {ticket.description}
                    </p>
                    <div className="flex gap-2 items-center text-sm text-gray-500">
                      <span>
                        {new Date(ticket.created_at).toLocaleDateString(
                          "id-ID",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                      {ticket.first_response_at && (
                        <span>
                          • Respons:{" "}
                          {new Date(
                            ticket.first_response_at,
                          ).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <div className="flex gap-2 mb-3 justify-end">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}
                      >
                        {ticket.status}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Tiket #{ticket.id}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.lastPage > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() =>
                setPagination({
                  ...pagination,
                  currentPage: pagination.currentPage - 1,
                })
              }
              disabled={pagination.currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              Sebelumnya
            </button>

            {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() =>
                    setPagination({ ...pagination, currentPage: page })
                  }
                  className={`px-3 py-2 rounded-md ${
                    pagination.currentPage === page
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ),
            )}

            <button
              onClick={() =>
                setPagination({
                  ...pagination,
                  currentPage: pagination.currentPage + 1,
                })
              }
              disabled={pagination.currentPage === pagination.lastPage}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              Berikutnya
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {pagination.total}
            </div>
            <div className="text-gray-600 text-sm">Total Tiket</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {tickets.filter((t) => t.status === "In-progress").length}
            </div>
            <div className="text-gray-600 text-sm">Sedang Diproses</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-green-600">
              {tickets.filter((t) => t.status === "Closed").length}
            </div>
            <div className="text-gray-600 text-sm">Selesai</div>
          </div>
        </div>
      </div>
    </div>
  );
}
