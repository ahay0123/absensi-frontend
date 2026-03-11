"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  AlertCircle,
  Loader2,
  Search,
  Eye,
  Calendar,
} from "lucide-react";
import api from "@/lib/axios";
import KepsekLayout from "@/components/KepsekLayout";
import Link from "next/link";

interface Teacher {
  id: number;
  name: string;
  email: string;
  is_assessed: boolean;
  assessment_id?: number;
  assessed_at?: string;
}

export default function AssessmentReportsPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [currentPeriod, setCurrentPeriod] = useState(
    new Date().toISOString().substring(0, 7),
  );

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/kepsek/assessment/teachers?period=${currentPeriod}`,
      );
      if (res.data.success) {
        setTeachers(res.data.data);
        setErrorMsg("");
      }
    } catch (err: any) {
      setErrorMsg("Gagal memuat data guru");
      console.error("Error fetching teachers:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPeriod]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const assessedTeachers = teachers.filter((t) => t.is_assessed);
  const filteredTeachers = assessedTeachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <KepsekLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={48} className="text-purple-600 animate-spin" />
            <p className="text-slate-600">Memuat data rapor...</p>
          </div>
        </div>
      </KepsekLayout>
    );
  }

  return (
    <KepsekLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <BarChart3 size={32} className="text-purple-600" />
              Rapor Penilaian Guru
            </h1>
            <p className="text-slate-600 mt-2">
              Lihat hasil penilaian dan analisis kinerja guru dalam bentuk
              grafik radar
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-xl">
              <AlertCircle size={20} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Period Selector */}
          <div className="mb-6 flex gap-4 items-center">
            <Calendar size={20} className="text-slate-600" />
            <input
              type="month"
              value={currentPeriod}
              onChange={(e) => setCurrentPeriod(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
            />
            <span className="text-sm text-slate-600">
              Total Rapor: {filteredTeachers.length}
            </span>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Cari nama guru..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Reports Table */}
          {filteredTeachers.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-4 px-6 font-semibold text-slate-900">
                        Nama Guru
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-900">
                        Email
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-900">
                        Tanggal Penilaian
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-900">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeachers.map((teacher) => (
                      <tr
                        key={teacher.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white font-bold text-sm">
                              {teacher.name.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-900">
                              {teacher.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {teacher.email}
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {teacher.assessed_at}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Link
                            href={`/kepala-sekolah/assessment/${teacher.id}/report?period=${encodeURIComponent(currentPeriod)}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-medium transition-colors"
                          >
                            <Eye size={18} />
                            Lihat Rapor
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <BarChart3 size={48} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Tidak ada rapor penilaian
              </h3>
              <p className="text-slate-600">
                Belum ada guru yang dinilai pada periode ini
              </p>
            </div>
          )}
        </div>
      </div>
    </KepsekLayout>
  );
}
