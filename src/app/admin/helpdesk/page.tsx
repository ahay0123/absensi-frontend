"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllTickets } from "@/services/helpDeskService";
import Alert from "@/components/Alert";

interface Ticket {
  id: number;
  subject: string;
  description: string;
  status: "Open" | "In-progress" | "Closed";
  priority: "Low" | "Mid" | "High";
  reporter_id: number;
  operator_id: number | null;
  created_at: string;
  updated_at: string;
  first_response_at: string | null;
  reporter?: any;
  operator?: any;
}

export default function AdminHelpDeskPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    operator_id: "",
    unassigned: false,
    search: "",
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 15,
  });

  useEffect(() => {
    fetchTickets();
  }, [pagination.currentPage, filters]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const result = await getAllTickets({
        page: pagination.currentPage,
        per_page: pagination.perPage,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        unassigned: filters.unassigned || undefined,
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Manajemen Helpdesk
          </h1>
          <p className="text-gray-600 mt-2">Kelola tiket dari semua pengguna</p>
        </div>

        {/* Alert */}
        {alert && (
          <div className="mb-6">
            <Alert type={alert.type} message={alert.message} />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Semua Prioritas</option>
                <option value="Low">Rendah</option>
                <option value="Mid">Sedang</option>
                <option value="High">Tinggi</option>
              </select>
            </div>

            {/* Unassigned */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.unassigned}
                  onChange={(e) => {
                    setFilters({ ...filters, unassigned: e.target.checked });
                    setPagination({ ...pagination, currentPage: 1 });
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">
                  Tiket Belum Ditugaskan
                </span>
              </label>
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
                placeholder="Subject atau deskripsi..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">
              {pagination.total}
            </div>
            <div className="text-gray-600 text-sm">Total Tiket</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">
              {tickets.filter((t) => t.status === "Open").length}
            </div>
            <div className="text-gray-600 text-sm">Open</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {tickets.filter((t) => t.status === "In-progress").length}
            </div>
            <div className="text-gray-600 text-sm">In-progress</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {tickets.filter((t) => t.status === "Closed").length}
            </div>
            <div className="text-gray-600 text-sm">Closed</div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">Memuat tiket...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">Belum ada tiket</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">
                      Pelapor
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-center font-medium text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center font-medium text-gray-700">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">
                      Dibuat
                    </th>
                    <th className="px-6 py-3 text-center font-medium text-gray-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-6 py-3 font-mono text-gray-900">
                        #{ticket.id}
                      </td>
                      <td className="px-6 py-3">
                        <Link
                          href={`/admin/helpdesk/${ticket.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {ticket.subject.length > 40
                            ? ticket.subject.substring(0, 40) + "..."
                            : ticket.subject}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-gray-700">
                        {ticket.reporter?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-3 text-gray-700">
                        {ticket.operator ? (
                          ticket.operator.name
                        ) : (
                          <span className="text-orange-600 font-medium">
                            Belum ditugaskan
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}
                        >
                          {getStatusIcon(ticket.status)} {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-700 text-xs">
                        {new Date(ticket.created_at).toLocaleDateString(
                          "id-ID",
                        )}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <Link
                          href={`/admin/helpdesk/${ticket.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Lihat
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.lastPage > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-center gap-2">
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    currentPage: pagination.currentPage - 1,
                  })
                }
                disabled={pagination.currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 text-sm"
              >
                Sebelumnya
              </button>

              {Array.from(
                { length: Math.min(5, pagination.lastPage) },
                (_, i) => {
                  let pageNum = i + 1;
                  if (pagination.currentPage > 3) {
                    pageNum = pagination.currentPage - 2 + i;
                  }
                  if (pageNum > pagination.lastPage) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() =>
                        setPagination({ ...pagination, currentPage: pageNum })
                      }
                      className={`px-3 py-2 rounded-md text-sm ${
                        pagination.currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                },
              )}

              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    currentPage: pagination.currentPage + 1,
                  })
                }
                disabled={pagination.currentPage === pagination.lastPage}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 text-sm"
              >
                Berikutnya
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
