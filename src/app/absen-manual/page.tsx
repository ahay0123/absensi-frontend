"use client";
import {
  ArrowLeft,
  Upload,
  FileText,
  Loader2,
  BookOpen,
  Clock,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import api from "@/lib/axios";
import Alert, { useAlert } from "@/components/Alert";

interface Schedule {
  id: number;
  subject: string;
  day: string;
  room: { name: string };
  start_time: string;
  end_time: string;
}

export default function AbsenManualSubmitPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<string>("");
  const [selectedScheduleData, setSelectedScheduleData] =
    useState<Schedule | null>(null);
  const [reason, setReason] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { alert, showAlert, hideAlert } = useAlert();

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const response = await api.get("/schedules");
        setSchedules(response.data.data || []);
      } catch (err) {
        console.error("Error fetching schedules:", err);
        showAlert("error", "Gagal memuat data jadwal");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const handleScheduleChange = (scheduleId: string) => {
    setSelectedSchedule(scheduleId);
    const selected = schedules.find((s) => s.id.toString() === scheduleId);
    setSelectedScheduleData(selected || null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showAlert("error", "Ukuran file maksimal 5MB");
        return;
      }

      if (
        !["application/pdf", "image/jpeg", "image/png", "image/jpg"].includes(
          file.type,
        )
      ) {
        showAlert("error", "Format file harus PDF, JPG, JPEG, atau PNG");
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSchedule) {
      showAlert("error", "Silakan pilih jadwal pelajaran");
      return;
    }

    if (!reason || reason.trim().length < 10) {
      showAlert("error", "Alasan minimal 10 karakter");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("schedule_id", selectedSchedule);
      formData.append("reason", reason.trim());
      if (selectedFile) {
        formData.append("proof", selectedFile);
      }

      const response = await api.post("/manual-attendances", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        showAlert("success", response.data.message);

        setTimeout(() => {
          setSelectedSchedule("");
          setSelectedScheduleData(null);
          setReason("");
          setSelectedFile(null);
          setPreviewUrl(null);
        }, 1500);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Gagal mengirim pengajuan absensi manual. Silakan coba lagi.";
      showAlert("error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-6">
      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={hideAlert} />
      )}

      {/* Header */}
      <div className="bg-indigo-600 text-white p-6 rounded-b-[2.5rem] shadow-xl">
        <Link
          href="/"
          className="flex items-center gap-2 mb-4 active:scale-95 transition-all w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium text-sm">Kembali</span>
        </Link>

        <div>
          <h1 className="text-2xl font-black mb-1">Absensi Manual</h1>
          <p className="text-indigo-100 text-sm">
            Ajukan absensi manual jika QR Code bermasalah atau tidak bisa
            di-scan
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Jadwal Selection */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
              <label className="block text-sm font-bold text-slate-600 mb-4">
                <BookOpen className="w-4 h-4 inline-block mr-2 text-indigo-600" />
                Pilih Jadwal Pelajaran *
              </label>

              <select
                value={selectedSchedule}
                onChange={(e) => handleScheduleChange(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">-- Pilih Jadwal Pelajaran --</option>
                {schedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.subject} • {schedule.day} •{" "}
                    {schedule.start_time.substring(0, 5)} -{" "}
                    {schedule.end_time.substring(0, 5)}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Schedule Info */}
            {selectedScheduleData && (
              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-[2rem] p-5 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">
                        {selectedScheduleData.subject}
                      </h3>
                      <p className="text-xs text-slate-500">Mata Pelajaran</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-indigo-200">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <div>
                        <p className="text-xs text-slate-500">Jam</p>
                        <p className="text-sm font-bold text-slate-800">
                          {selectedScheduleData.start_time.substring(0, 5)} -{" "}
                          {selectedScheduleData.end_time.substring(0, 5)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                      <div>
                        <p className="text-xs text-slate-500">Ruang</p>
                        <p className="text-sm font-bold text-slate-800">
                          {selectedScheduleData.room.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reason */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
              <label className="block text-sm font-bold text-slate-600 mb-3">
                Alasan Absensi Manual *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Jelaskan alasan mengapa Anda tidak bisa melakukan check-in melalui QR Code (minimal 10 karakter)"
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-medium text-slate-700 resize-none"
              />
              <div className="flex justify-between items-center mt-3">
                <p
                  className={`text-xs font-medium ${
                    reason.length >= 10 ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  {reason.length} / 10 karakter minimum
                </p>
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
              <label className="block text-sm font-bold text-slate-600 mb-3">
                <Upload className="w-4 h-4 inline-block mr-2 text-indigo-600" />
                Dokumen Pendukung (Opsional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />

              {!previewUrl ? (
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="w-full py-8 border-2 border-dashed border-slate-300 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center"
                >
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm font-bold text-slate-600">
                    Klik untuk unggah file
                  </p>
                  <p className="text-xs text-slate-400">
                    PDF, JPG, JPEG, PNG (max 5MB)
                  </p>
                </button>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    ✓ {selectedFile?.name}
                  </p>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                submitting || !selectedSchedule || reason.trim().length < 10
              }
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mengirim Pengajuan...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Ajukan Absensi Manual
                </>
              )}
            </button>

            <p className="text-xs text-center text-slate-500 italic">
              Pengajuan akan ditinjau oleh kepala sekolah maksimal dalam 24 jam
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
