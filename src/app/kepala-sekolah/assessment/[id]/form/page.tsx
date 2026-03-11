"use client";
import React, { useEffect, useState, useCallback, use } from "react";
import { useSearchParams } from "next/navigation";
import KepsekLayout from "@/components/KepsekLayout";
import {
  ArrowLeft,
  Star,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  MessageSquare,
  X,
} from "lucide-react";
import api from "@/lib/axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Teacher {
  id: number;
  name: string;
  email: string;
  nip?: string;
  avatar?: string;
  gender?: string;
}

interface Indicator {
  id: number;
  name: string;
  description?: string;
  type: string;
}

interface Score {
  category_id: number;
  score: number;
}

interface AssessmentDetail {
  category_id: number;
  category_name: string;
  score: number;
}

export default function AssessmentFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState(
    new Date().toISOString().substring(0, 7),
  );

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [scores, setScores] = useState<{ [key: number]: number }>({});
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [nextTeacher, setNextTeacher] = useState<Teacher | null>(null);

  // Extract period from query params and teacherId from route params
  useEffect(() => {
    const periodParam = searchParams.get("period");
    if (periodParam) {
      setCurrentPeriod(periodParam);
    }
    const newTeacherId = parseInt(id);
    setTeacherId(newTeacherId);
  }, [id, searchParams]);

  const fetchData = useCallback(async () => {
    if (!teacherId) return;

    setLoading(true);
    try {
      const [teacherRes, indicatorsRes] = await Promise.all([
        api.get(
          `/kepsek/assessment/teachers/${teacherId}?period=${currentPeriod}`,
        ),
        api.get(`/kepsek/assessment/indicators`),
      ]);

      setTeacher(teacherRes.data.data);
      setIndicators(indicatorsRes.data.data);

      // If teacher already has assessment, populate the form
      if (
        teacherRes.data.data.assessment_details &&
        teacherRes.data.data.assessment_details.length > 0
      ) {
        const scoreMap: { [key: number]: number } = {};
        teacherRes.data.data.assessment_details.forEach(
          (detail: AssessmentDetail) => {
            scoreMap[detail.category_id] = detail.score;
          },
        );
        setScores(scoreMap);
        setNotes(teacherRes.data.data.general_notes || "");
      }

      setErrorMsg("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setErrorMsg("Gagal memuat data penilaian");
    } finally {
      setLoading(false);
    }
  }, [teacherId, currentPeriod]);

  // Set teacherId when params are resolved
  useEffect(() => {
    const newTeacherId = parseInt(id);
    setTeacherId(newTeacherId);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleScoreChange = (categoryId: number, score: number) => {
    setScores({
      ...scores,
      [categoryId]: score,
    });
  };

  const isFormValid = () => {
    // Check if all indicators have been scored
    return indicators.every((indicator) => scores[indicator.id]);
  };

  const handleSave = async (saveAndNext: boolean = false) => {
    if (!teacher || !isFormValid()) {
      setErrorMsg("Semua indikator harus dinilai");
      return;
    }

    setSubmitting(true);
    try {
      const assessmentScores = indicators.map((indicator) => ({
        category_id: indicator.id,
        score: scores[indicator.id],
      }));

      await api.post(`/kepsek/assessment/teachers/${teacherId}`, {
        period: currentPeriod,
        assessment_date: new Date().toISOString().split("T")[0],
        general_notes: notes,
        scores: assessmentScores,
      });

      setSuccessMsg("Penilaian berhasil disimpan!");

      if (saveAndNext) {
        // Fetch next teacher
        const nextRes = await api.get(
          `/kepsek/assessment/next-teacher?current_teacher_id=${teacherId}&period=${currentPeriod}`,
        );

        if (nextRes.data.data) {
          setTimeout(() => {
            router.push(
              `/kepala-sekolah/assessment/${nextRes.data.data.id}/form`,
            );
          }, 1000);
        } else {
          // All teachers assessed
          setTimeout(() => {
            router.push(`/kepala-sekolah/assessment`);
          }, 2000);
        }
      } else {
        setTimeout(() => {
          router.push(`/kepala-sekolah/assessment`);
        }, 2000);
      }
    } catch (err: any) {
      console.error("Error submitting assessment:", err);
      setErrorMsg(err.response?.data?.message || "Gagal menyimpan penilaian");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <KepsekLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-purple-600" />
            <span className="text-slate-600 font-medium">
              Memuat form penilaian...
            </span>
          </div>
        </div>
      </KepsekLayout>
    );
  }

  if (!teacher || indicators.length === 0) {
    return (
      <KepsekLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6">
          <div className="flex items-center gap-3 text-red-600 mb-6">
            <AlertCircle size={20} />
            <span>Data guru atau indikator penilaian tidak ditemukan</span>
          </div>
          <Link
            href="/kepala-sekolah/assessment"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft size={20} />
            Kembali ke Dashboard
          </Link>
        </div>
      </KepsekLayout>
    );
  }

  const unassignedCount = indicators.filter((ind) => !scores[ind.id]).length;

  return (
    <KepsekLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/kepala-sekolah/assessment"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 font-medium"
          >
            <ArrowLeft size={20} />
            Kembali ke Dashboard
          </Link>

          <h1 className="text-3xl font-bold text-slate-900">
            Formulir Penilaian Guru
          </h1>
          <p className="text-slate-600 mt-2">
            Periode:{" "}
            {new Date(currentPeriod).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "long",
            })}
          </p>
        </div>

        {/* Teacher Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {teacher.name.charAt(0)}
              </div>
            </div>

            {/* Teacher Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">
                {teacher.name}
              </h2>
              <p className="text-slate-600 mt-1">{teacher.email}</p>
              {teacher.nip && (
                <p className="text-slate-600 text-sm">NIP: {teacher.nip}</p>
              )}
              {teacher.gender && (
                <p className="text-slate-600 text-sm capitalize">
                  Jenis Kelamin:{" "}
                  {teacher.gender === "laki-laki" ? "Laki-laki" : "Perempuan"}
                </p>
              )}
            </div>

            {/* Progress Badge */}
            <div className="text-right">
              <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold">
                {indicators.length - unassignedCount} dari {indicators.length}
              </div>
              <p className="text-sm text-slate-600 mt-2">indikator dinilai</p>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {errorMsg && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-lg">
            <AlertCircle size={20} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-5 py-4 rounded-lg animate-slide-in">
            <CheckCircle size={20} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Penilaian Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-8">
            Indikator Penilaian
          </h3>

          <div className="space-y-8">
            {indicators.map((indicator, index) => (
              <div
                key={indicator.id}
                className="pb-8 border-b border-slate-100 last:border-b-0"
              >
                {/* Indicator Name & Type */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        {index + 1}. {indicator.name}
                      </h4>
                      {indicator.description && (
                        <p className="text-sm text-slate-600 mt-1">
                          {indicator.description}
                        </p>
                      )}
                      <span className="inline-block mt-2 px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                        {indicator.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleScoreChange(indicator.id, star)}
                        className={`transition-all transform hover:scale-110 ${
                          (scores[indicator.id] || 0) >= star
                            ? "text-yellow-400 drop-shadow-lg"
                            : "text-slate-300 hover:text-yellow-300"
                        }`}
                        title={`Rating ${star}`}
                      >
                        <Star
                          size={36}
                          className="fill-current"
                          strokeWidth={1.5}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Score Display */}
                  {scores[indicator.id] && (
                    <div className="ml-4 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg font-semibold">
                      {scores[indicator.id]}/5
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare size={20} className="text-purple-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Catatan/Feedback (Opsional)
            </h3>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Berikan feedback atau catatan untuk guru ini. Misalnya: kekuatan, area pengembangan, atau pencapaian khusus..."
            rows={6}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
          />
          <p className="text-sm text-slate-600 mt-2">
            {notes.length} / 1000 karakter
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pb-8">
          <button
            onClick={() => router.push("/kepala-sekolah/assessment")}
            className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Batal
          </button>

          <button
            onClick={() => handleSave(false)}
            disabled={submitting || !isFormValid()}
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={18} className="animate-spin" />}
            {submitting ? "Menyimpan..." : "Simpan"}
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={submitting || !isFormValid()}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={18} className="animate-spin" />}
            {submitting
              ? "Menyimpan..."
              : "Simpan & Lanjut ke Orang Berikutnya"}
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Completion Status */}
        {!isFormValid() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800 text-sm">
            <span className="font-medium">
              Perhatian: Masih ada {unassignedCount} indikator yang belum
              dinilai.
            </span>{" "}
            Lengkapi semua penilaian sebelum menyimpan.
          </div>
        )}
      </div>
    </KepsekLayout>
  );
}
