"use client";
import React, { useEffect, useState } from "react";
import KepsekLayout from "@/components/KepsekLayout";
import {
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  BarChart3,
  Search,
  Loader2,
  AlertCircle,
  Star,
  ChevronRight,
  Eye,
} from "lucide-react";
import api from "@/lib/axios";
import Link from "next/link";

interface Teacher {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  is_assessed: boolean;
  assessment_id?: number;
  assessed_at?: string;
}

interface ProgressData {
  period: string;
  total_teachers: number;
  assessed_count: number;
  remaining: number;
  percentage: number;
}

export default function AssessmentDashboard() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentPeriod, setCurrentPeriod] = useState(
    new Date().toISOString().substring(0, 7),
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teachersRes, progressRes] = await Promise.all([
        api.get(`/kepsek/assessment/teachers?period=${currentPeriod}`),
        api.get(`/kepsek/assessment/progress?period=${currentPeriod}`),
      ]);

      setTeachers(teachersRes.data.data);
      setProgress(progressRes.data.data);
      setErrorMsg("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setErrorMsg("Gagal memuat data penilaian");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPeriod]);

  // Filter teachers by search
  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(search.toLowerCase()),
  );

  const assessedTeachers = filteredTeachers.filter((t) => t.is_assessed);
  const unassessedTeachers = filteredTeachers.filter((t) => !t.is_assessed);

  return (
    <KepsekLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Penilaian Guru</h1>
          <p className="text-slate-600 mt-2">
            Kelola penilaian kedisiplinan dan kinerja guru dengan mudah
          </p>
        </div>

        {/* Period Selector */}
        <div className="mb-6 flex gap-4">
          <input
            type="month"
            value={currentPeriod}
            onChange={(e) => setCurrentPeriod(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-lg">
            <AlertCircle size={20} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Progress Cards */}
        {progress && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Total Teachers Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">
                    Total Guru
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {progress.total_teachers}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            {/* Assessed Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">
                    Sudah Dinilai
                  </p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {progress.assessed_count}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            {/* Remaining Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">
                    Belum Dinilai
                  </p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {progress.remaining}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock size={24} className="text-orange-600" />
                </div>
              </div>
            </div>

            {/* Progress Percentage Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Progress</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {progress.percentage}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp size={24} className="text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {progress && (
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Progress Penilaian Bulan Ini
              </h2>
              <span className="text-sm text-slate-600">
                {progress.assessed_count} dari {progress.total_teachers} guru
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-600 mt-3">
              Anda telah menilai {progress.assessed_count} dari{" "}
              {progress.total_teachers} guru. Masih ada{" "}
              <span className="font-semibold">{progress.remaining}</span> guru
              yang perlu dinilai.
            </p>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
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
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Unassessed Teachers Section */}
        {unassessedTeachers.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Clock size={20} className="text-orange-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Belum Dinilai ({unassessedTeachers.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unassessedTeachers.map((teacher) => (
                <Link
                  key={teacher.id}
                  href={`/kepala-sekolah/assessment/${teacher.id}/form?period=${encodeURIComponent(currentPeriod)}`}
                >
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer group">
                    {/* Teacher Avatar */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold shadow-md">
                        {teacher.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {teacher.name}
                        </h3>
                        <p className="text-sm text-slate-600 truncate">
                          {teacher.email}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        Belum Dinilai
                      </span>
                      <ChevronRight
                        size={20}
                        className="text-slate-400 group-hover:text-purple-600 transition-colors"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Assessed Teachers Section */}
        {assessedTeachers.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle size={20} className="text-green-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Sudah Dinilai ({assessedTeachers.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assessedTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="bg-white rounded-xl shadow-sm border border-green-200 p-5 hover:shadow-lg hover:border-green-400 transition-all"
                >
                  {/* Teacher Avatar */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white font-bold shadow-md">
                      {teacher.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {teacher.name}
                      </h3>
                      <p className="text-xs text-slate-600 truncate">
                        Dinilai: {teacher.assessed_at}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium inline-flex items-center gap-1">
                      <Star size={12} className="fill-current" /> Sudah Dinilai
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/kepala-sekolah/assessment/${teacher.id}/form?period=${encodeURIComponent(currentPeriod)}`}
                      className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <ChevronRight size={16} />
                      Edit
                    </Link>
                    <Link
                      href={`/kepala-sekolah/assessment/${teacher.id}/report?period=${encodeURIComponent(currentPeriod)}`}
                      className="flex-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye size={16} />
                      Rapor
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredTeachers.length === 0 && search.length > 0 && (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Guru tidak ditemukan</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center gap-2 py-12">
            <Loader2 size={20} className="animate-spin text-purple-600" />
            <span className="text-slate-600">Memuat data guru...</span>
          </div>
        )}
      </div>
    </KepsekLayout>
  );
}
