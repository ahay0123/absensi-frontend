"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Clock,
  MapPin,
  BookOpen,
  Users,
  CheckCircle2,
  Loader2,
  QrCode,
  X,
} from "lucide-react";
import api from "@/lib/axios";

export const dynamic = "force-dynamic";

interface Student {
  id: number;
  name: string;
  nis: string;
  attended?: boolean;
}

interface Schedule {
  id: number;
  subject: {
    name: string;
  };
  room: {
    name: string;
  };
  start_time: string;
  end_time: string;
}

export default function AbsensiPage() {
  const params = useParams();
  const router = useRouter();
  const scheduleId = params?.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        console.log("📚 Fetching schedule data for ID:", scheduleId);
        const response = await api.get(`/schedules/${scheduleId}`);
        setSchedule(response.data.schedule);
        setStudents(response.data.students || []);
        console.log("✅ Schedule loaded:", response.data);
      } catch (err) {
        console.error("❌ Error loading schedule:", err);
        alert("Gagal memuat data jadwal");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    if (scheduleId) {
      fetchScheduleData();
    }
  }, [scheduleId, router]);

  const toggleAttendance = (studentId: number) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? { ...student, attended: !student.attended }
          : student
      )
    );
  };

  const handleSubmit = async () => {
    const attendedStudents = students
      .filter((s) => s.attended)
      .map((s) => s.id);

    if (attendedStudents.length === 0) {
      alert("Pilih setidaknya satu siswa yang hadir");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/attendance/${scheduleId}`, {
        student_ids: attendedStudents,
      });
      alert(`Absensi berhasil! ${attendedStudents.length} siswa hadir.`);
      router.push("/");
    } catch (err: any) {
      console.error("❌ Error submitting attendance:", err);
      alert(
        err.response?.data?.message || "Gagal menyimpan absensi. Coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-8">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-6 rounded-b-[2.5rem] shadow-xl">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 mb-4 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium text-sm">Kembali</span>
        </button>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <h1 className="text-xl font-bold">
              {schedule?.subject?.name || "Mata Pelajaran"}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-indigo-100 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                {schedule?.start_time?.substring(0, 5)} -{" "}
                {schedule?.end_time?.substring(0, 5)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{schedule?.room?.name || "Ruang Kelas"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 flex gap-3">
        <button
          onClick={() => setShowScanner(!showScanner)}
          className="flex-1 bg-white border-2 border-indigo-600 text-indigo-600 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          {showScanner ? (
            <>
              <X className="w-5 h-5" />
              Tutup QR
            </>
          ) : (
            <>
              <QrCode className="w-5 h-5" />
              Scan QR
            </>
          )}
        </button>
      </div>

      {/* QR Scanner Placeholder */}
      {showScanner && (
        <div className="mx-6 mb-4 bg-slate-800 rounded-2xl p-8 text-center">
          <QrCode className="w-16 h-16 text-white mx-auto mb-3 opacity-50" />
          <p className="text-white text-sm font-medium">
            QR Scanner akan diimplementasikan di sini
          </p>
          <p className="text-slate-400 text-xs mt-1">
            Gunakan daftar manual di bawah untuk saat ini
          </p>
        </div>
      )}

      {/* Student List */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Daftar Siswa ({students.length})
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            {students.filter((s) => s.attended).length} hadir
          </span>
        </div>

        <div className="space-y-2">
          {students.map((student) => (
            <button
              key={student.id}
              onClick={() => toggleAttendance(student.id)}
              className={`w-full p-4 rounded-2xl border-2 transition-all active:scale-95 flex items-center justify-between ${student.attended
                  ? "bg-indigo-50 border-indigo-600"
                  : "bg-white border-slate-100"
                }`}
            >
              <div className="text-left">
                <p
                  className={`font-bold text-sm ${student.attended ? "text-indigo-600" : "text-slate-800"}`}
                >
                  {student.name}
                </p>
                <p className="text-xs text-slate-400">{student.nis}</p>
              </div>
              {student.attended && (
                <CheckCircle2 className="w-6 h-6 text-indigo-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100">
        <button
          onClick={handleSubmit}
          disabled={submitting || students.filter((s) => s.attended).length === 0}
          className="w-full bg-indigo-600 text-white font-bold py-5 rounded-2xl shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Simpan Absensi ({students.filter((s) => s.attended).length}{" "}
              Siswa)
            </>
          )}
        </button>
      </div>
    </main>
  );
}
