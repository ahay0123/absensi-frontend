"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { use } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  ArrowLeft,
  Calendar,
  BarChart3,
  AlertCircle,
  Loader2,
  Star,
} from "lucide-react";
import api from "@/lib/axios";
import KepsekLayout from "@/components/KepsekLayout";

interface TeacherData {
  id: number;
  name: string;
  email: string;
  nip?: string;
  avatar?: string;
}

interface ScoreData {
  category: string;
  type: string;
  score: number;
}

interface HistoryItem {
  id: number;
  period: string;
  assessment_date: string;
  created_at: string;
  general_notes?: string;
  average_score: number;
  scores: ScoreData[];
}

interface ReportData {
  teacher: TeacherData;
  current_period: string;
  current_scores: ScoreData[];
  history: HistoryItem[];
  total_assessments: number;
  message?: string;
}

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const teacherId = parseInt(id);

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>(
    new Date().toISOString().substring(0, 7),
  );

  useEffect(() => {
    const periodParam = searchParams.get("period");
    if (periodParam) {
      setSelectedPeriod(periodParam);
    }
  }, [searchParams]);

  const fetchReport = useCallback(async () => {
    if (!teacherId) return;

    setLoading(true);
    try {
      const res = await api.get(
        `/kepsek/assessment/teacher/${teacherId}/report?period=${encodeURIComponent(selectedPeriod)}`,
      );

      if (res.data.success) {
        setReport(res.data.data);
      } else {
        setErrorMsg("Gagal memuat data rapor");
      }
    } catch (error: any) {
      setErrorMsg(
        error.response?.data?.message || "Gagal memuat data rapor guru",
      );
    } finally {
      setLoading(false);
    }
  }, [teacherId, selectedPeriod]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

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

  if (!report) {
    return (
      <KepsekLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-8">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 font-medium"
            >
              <ArrowLeft size={20} />
              Kembali
            </button>

            {errorMsg && (
              <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-xl">
                <AlertCircle size={20} />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>
      </KepsekLayout>
    );
  }

  const radarData = report.current_scores.map((item) => ({
    ...item,
    score: item.score || 0,
  }));

  const getScoreBadgeColor = (score: number) => {
    if (score >= 4.5) return "bg-green-100 text-green-800";
    if (score >= 3.5) return "bg-blue-100 text-blue-800";
    if (score >= 2.5) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <KepsekLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 font-medium"
            >
              <ArrowLeft size={20} />
              Kembali ke Penilaian
            </button>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  Rapor Penilaian Guru
                </h1>
                <p className="text-slate-600">
                  Visualisasi dan riwayat penilaian untuk {report.teacher.name}
                </p>
              </div>
              <div className="text-right">
                <div className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold">
                  Total: {report.total_assessments} Periode
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="flex items-center gap-6">
              {report.teacher.avatar && (
                <img
                  src={report.teacher.avatar}
                  alt={report.teacher.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900">
                  {report.teacher.name}
                </h2>
                <p className="text-slate-600">{report.teacher.email}</p>
                {report.teacher.nip && (
                  <p className="text-sm text-slate-600">
                    NIP: {report.teacher.nip}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Radar Chart Section */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                <BarChart3 size={24} className="text-purple-600" />
                Grafik Radar Penilaian (Periode: {report.current_period})
              </h3>

              {radarData.length > 0 ? (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis
                        dataKey="category"
                        tick={{ fontSize: 12, fill: "#64748b" }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 5]}
                        tick={{ fontSize: 12, fill: "#64748b" }}
                      />
                      <Radar
                        name="Skor"
                        dataKey="score"
                        stroke="#9333ea"
                        fill="#9333ea"
                        fillOpacity={0.6}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #475569",
                          borderRadius: "8px",
                          color: "#f1f5f9",
                        }}
                        formatter={(value) => [`${value}/5`, "Skor"]}
                      />
                      <Legend
                        wrapperStyle={{
                          paddingTop: "20px",
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center text-slate-500">
                  Belum ada data penilaian
                </div>
              )}
            </div>

            {/* Score Summary Cards */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Star size={20} className="text-yellow-500" />
                Ringkasan Skor
              </h3>

              {radarData.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.category}
                      </p>
                      <p className="text-xs text-slate-600">{item.type}</p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-lg font-bold text-sm ${getScoreBadgeColor(
                        item.score,
                      )}`}
                    >
                      {item.score}/5
                    </div>
                  </div>

                  {/* Star rating visual */}
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={`h-2 flex-1 rounded-full ${
                          star <= item.score ? "bg-yellow-400" : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
              <Calendar size={24} className="text-purple-600" />
              Riwayat Penilaian
            </h3>

            {report.history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">
                        Periode
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">
                        Tanggal Penilaian
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">
                        Rata-rata Skor
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">
                        Detail Skor
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">
                        Catatan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.history
                      .filter((item) => item.period === selectedPeriod)
                      .map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-slate-400" />
                              <span className="font-medium text-slate-900">
                                {item.period}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-slate-600">
                            {item.assessment_date}
                          </td>
                          <td className="py-4 px-4">
                            <div
                              className={`inline-block px-3 py-1 rounded-lg font-bold text-sm ${getScoreBadgeColor(
                                item.average_score,
                              )}`}
                            >
                              {item.average_score}/5
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-2">
                              {item.scores.map((score, idx) => (
                                <div
                                  key={idx}
                                  className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-700 font-medium"
                                >
                                  {score.category}:{" "}
                                  <span className="font-bold">
                                    {score.score}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {item.general_notes ? (
                              <div className="max-w-xs text-sm text-slate-600 truncate hover:whitespace-normal hover:overflow-visible cursor-help">
                                {item.general_notes}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-sm">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                Belum ada riwayat penilaian
              </div>
            )}
          </div>
        </div>
      </div>
    </KepsekLayout>
  );
}
