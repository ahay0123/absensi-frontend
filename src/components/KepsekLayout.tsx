"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Star,
  BarChart3,
} from "lucide-react";
import { getUser, isKepsek, logout } from "@/lib/auth";

export default function KepsekLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Client-side auth check
    const currentUser = getUser();
    if (!currentUser || !isKepsek()) {
      window.location.href = "/login";
    } else {
      setUser(currentUser);
    }
  }, []);

  const navs = [
    { name: "Dashboard", href: "/kepala-sekolah", icon: LayoutDashboard },
    {
      name: "Penilaian Guru",
      href: "/kepala-sekolah/assessment",
      icon: Star,
    },
    {
      name: "Rapor Penilaian",
      href: "/kepala-sekolah/assessment-reports",
      icon: BarChart3,
    },
    {
      name: "Laporan Absensi",
      href: "/kepala-sekolah/reports",
      icon: FileText,
    },
    {
      name: "Pengajuan Izin",
      href: "/kepala-sekolah/leave-requests",
      icon: FileText,
    },
    {
      name: "Absensi Manual",
      href: "/kepala-sekolah/absen-manual",
      icon: FileText,
    },
  ];

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 z-50 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="font-black text-xl text-white tracking-tight">
              E-<span className="text-indigo-500">Presensi</span>
            </h2>
            <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
              Panel Kepala Sekolah
            </p>
          </div>
          <button
            className="lg:hidden text-slate-400"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navs.map((nav) => {
            const isActive = pathname === nav.href;
            return (
              <Link
                key={nav.href}
                href={nav.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent"
                }`}
              >
                <nav.icon
                  className={`w-5 h-5 ${isActive ? "text-indigo-400" : "text-slate-500"}`}
                />
                {nav.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden ring-2 ring-slate-700">
              <img
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${user.name}&background=1e293b&color=cbd5e1`
                }
                alt="avatar"
              />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate uppercase mt-0.5 tracking-wider">
                Kepala Sekolah
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-500/10 text-slate-300 hover:text-red-400 rounded-xl text-sm font-bold transition-all border border-slate-700 hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-auto">
        {/* Mobile Header */}
        <header className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center gap-4 sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-400 bg-slate-800 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-white">Panel Kepsek</h1>
        </header>

        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
