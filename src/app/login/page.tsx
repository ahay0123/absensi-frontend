"use client";
import { useState } from "react";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import Link from "next/link";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/login", formData);
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.location.href = "/"; // Ke Dashboard
    } catch (err: any) {
      alert(err.response?.data?.message || "Login Gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center p-8">
      <div className="max-w-md mx-auto w-full space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto rotate-3 shadow-xl shadow-indigo-200 mb-6">
            <LogIn className="w-10 h-10 text-white -rotate-3" />
          </div>
          <h1 className="text-3xl font-black text-slate-800">Selamat Datang</h1>
          <p className="text-slate-400 mt-2 font-medium">
            Masuk untuk mulai mengajar
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium text-slate-700"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-5 rounded-2xl shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              "Masuk Sekarang"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 font-medium">
          Belum punya akun?{" "}
          <Link href="/register" className="text-indigo-600 font-bold">
            Daftar di sini
          </Link>
        </p>
      </div>
    </main>
  );
}
