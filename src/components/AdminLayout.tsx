"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Calendar,
  MapPin,
  ClipboardList,
  FileText,
  Settings,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  QrCode as QrCodeIcon,
  Star,
} from "lucide-react";
import { getUser, isAdmin, logout } from "@/lib/auth";

export default function AdminLayout({
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
    if (!currentUser || !isAdmin()) {
      window.location.href = "/login";
    } else {
      setUser(currentUser);
    }
  }, []);

  const navs = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    // INPUT Section
    { name: "Data Guru", href: "/admin/users", icon: Users },
    { name: "Jadwal", href: "/admin/schedules", icon: Calendar },
    { name: "Lokasi Ruang", href: "/admin/rooms", icon: MapPin },
    {
      name: "Indikator Penilaian",
      href: "/admin/assessment-categories",
      icon: Star,
    },
    // PROSES Section
    { name: "Data Absensi", href: "/admin/attendances", icon: ClipboardList },
    // OUTPUT Section
    { name: "Display QR", href: "/admin/rooms/all-qrs", icon: QrCodeIcon },
    // SETTINGS Section
    { name: "Profil Sekolah", href: "/admin/school-profile", icon: Settings },
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
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 z-50 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="font-black text-xl text-slate-800 tracking-tight">
              Admin<span className="text-indigo-600">Panel</span>
            </h2>
            <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
              Absensi Guru
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
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <nav.icon
                  className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
                />
                {nav.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 overflow-hidden">
              <img
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${user.name}&background=e0e7ff&color=4f46e5`
                }
                alt="avatar"
              />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-400 truncate">Administrator</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-100 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold transition-all"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-auto">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-100 p-4 flex items-center gap-4 sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-600 bg-slate-50 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-slate-800">Admin Panel</h1>
        </header>

        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
