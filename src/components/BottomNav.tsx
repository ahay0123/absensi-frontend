"use client";
import { Home, History, BarChart2, User, Scan } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/register") return null;

  const navs = [
    { name: "Home", icon: Home, path: "/" },
    { name: "History", icon: History, path: "/history" },
    { name: "Stats", icon: BarChart2, path: "/stats" },
    { name: "Profile", icon: User, path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center z-50">
      {navs.map((nav) => {
        const isActive = pathname === nav.path;
        return (
          <Link
            key={nav.path}
            href={nav.path}
            className="flex flex-col items-center gap-1"
          >
            <nav.icon
              className={`w-6 h-6 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
            />
            <span
              className={`text-[10px] font-medium ${isActive ? "text-indigo-600" : "text-slate-400"}`}
            >
              {nav.name}
            </span>
          </Link>
        );
      })}

      {/* Floating Scan Button */}
      <Link
        href="/absensi"
        className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-indigo-600 rounded-full border-[8px] border-slate-50 flex items-center justify-center shadow-lg shadow-indigo-200 active:scale-90 transition-all"
      >
        <div className="flex flex-col items-center">
          <Scan className="text-white w-8 h-8" />
          <span className="text-[8px] text-white font-bold mt-1 uppercase tracking-tighter">
            Scan QR
          </span>
        </div>
      </Link>
    </div>
  );
}
