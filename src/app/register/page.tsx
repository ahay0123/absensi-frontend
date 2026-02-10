"use client";
import { useState } from "react";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Fingerprint,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import api from "@/lib/axios";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nip: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/register", formData);

      // Simpan token & data user setelah registrasi berhasil
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.location.href = "/"; // Langsung ke Dashboard
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        "Registrasi Gagal. Cek kembali data Anda.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center p-8 pb-12">
      <div className="max-w-md mx-auto w-full space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto rotate-3 shadow-xl shadow-indigo-200 mb-6">
            <UserPlus className="w-10 h-10 text-white -rotate-3" />
          </div>
          <h1 className="text-3xl font-black text-slate-800">Daftar Akun</h1>
          <p className="text-slate-400 mt-2 font-medium italic">
            PWA Presensi Guru v1.0
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Input Nama Lengkap */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input
              type="text"
              placeholder="Nama Lengkap & Gelar"
              className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium text-slate-700"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          {/* Input Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input
              type="email"
              placeholder="Email Sekolah"
              className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium text-slate-700"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          {/* Input NIP */}
          <div className="relative">
            <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input
              type="text"
              placeholder="Nomor Induk Pegawai (NIP)"
              className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium text-slate-700"
              onChange={(e) =>
                setFormData({ ...formData, nip: e.target.value })
              }
              required
            />
          </div>

          {/* Input Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input
              type="password"
              placeholder="Buat Password"
              className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium text-slate-700"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>

          {/* Konfirmasi Password */}
          <div className="relative">
            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input
              type="password"
              placeholder="Ulangi Password"
              className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium text-slate-700"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password_confirmation: e.target.value,
                })
              }
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-5 rounded-2xl shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              "Daftar Akun Sekarang"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 font-medium">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-indigo-600 font-bold underline underline-offset-4"
          >
            Masuk Ke Aplikasi
          </Link>
        </p>
      </div>
    </main>
  );
}
