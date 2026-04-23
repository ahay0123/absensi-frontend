"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  Users,
  MapPin,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  UserPlus,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import api from "@/lib/axios";
import Link from "next/link";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/admin/dashboard");
        setData(res.data.data);
      } catch (err) {
        console.error("Failed to fetch dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Ringkasan data sistem absensi hari ini
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase">
              Total Guru
            </p>
            <h3 className="text-2xl font-black text-slate-800">
              {data?.total_guru || 0}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0">
            <MapPin className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase">
              Ruang Terdaftar
            </p>
            <h3 className="text-2xl font-black text-slate-800">
              {data?.total_ruang || 0}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase">
              Jadwal Hari Ini
            </p>
            <h3 className="text-2xl font-black text-slate-800">
              {data?.jadwal_hari_ini || 0}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase">
              Izin Pending
            </p>
            <h3 className="text-2xl font-black text-slate-800">
              {data?.pending_leaves || 0}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Summary */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-lg text-slate-800 mb-6">
              Rekap Absensi Hari Ini
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
                <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-black text-xl text-emerald-700">
                  {data?.attendance_summary?.Hadir || 0}
                </h4>
                <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1">
                  Hadir Tepat
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center">
                <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <h4 className="font-black text-xl text-amber-700">
                  {data?.attendance_summary?.Terlambat || 0}
                </h4>
                <p className="text-[10px] font-bold text-amber-600 uppercase mt-1">
                  Terlambat
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-center">
                <UserPlus className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <h4 className="font-black text-xl text-blue-700">
                  {data?.attendance_summary?.Izin || 0}
                </h4>
                <p className="text-[10px] font-bold text-blue-600 uppercase mt-1">
                  Izin/Sakit
                </p>
              </div>
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-center">
                <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <h4 className="font-black text-xl text-red-700">
                  {data?.attendance_summary?.Alpa || 0}
                </h4>
                <p className="text-[10px] font-bold text-red-600 uppercase mt-1">
                  Alpa
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Guru yang sudah absen hari ini
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Hadir atau Terlambat minimal 1 kelas
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-indigo-600">
                {data?.guru_hadir_hari_ini || 0}
              </span>
              <span className="text-sm font-medium text-slate-400">
                {" "}
                / {data?.total_guru || 0} Guru
              </span>
            </div>
          </div>
        </div>

        {/* Demonstration Mode */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-bold text-xl mb-2">Mode Demonstrasi</h2>
            <p className="text-sm text-indigo-100 mb-6 leading-relaxed">
              Gunakan alat ini untuk mendemonstrasikan alur presensi secara
              langsung.
            </p>

            <div className="space-y-3">
              <Link
                href="/admin/rooms/all-qrs"
                className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm">
                    Tampilkan QR Dinamis
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>

              <Link
                href="/history"
                className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm">Lihat History Guru</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </div>

          <p className="text-[10px] text-indigo-200/60 font-medium uppercase tracking-widest text-center mt-6">
            Presentation Ready • v1.0
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
