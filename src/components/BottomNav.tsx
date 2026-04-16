"use client";
import {
  Home,
  History,
  BarChart2,
  User,
  Scan,
  FileText,
  Coins,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Alert, { useAlert } from "@/components/Alert";

export default function BottomNav() {
  const pathname = usePathname();
  const { alert, showAlert, hideAlert } = useAlert();

  if (pathname === "/login" || pathname === "/register") return null;

  const navs = [
    { name: "Home", icon: Home, path: "/" },
    { name: "History", icon: History, path: "/history" },
    { name: "Point", icon: Coins, path: "/point/wallet" },
    { name: "Stats", icon: BarChart2, path: "/stats" },
    { name: "Profile", icon: User, path: "/profile" },
  ];

  const handleScanClick = () => {
    if (pathname !== "/") {
      window.location.href = "/";
    } else {
      showAlert(
        "info",
        "Silahkan pilih mata pelajaran pada jadwal di bawah untuk mulai absen",
      );
    }
  };

  return (
    <>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          duration={4000}
          onClose={hideAlert}
        />
      )}

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
        {/* <button
          onClick={handleScanClick}
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-indigo-600 rounded-full border-[8px] border-slate-50 flex items-center justify-center shadow-lg shadow-indigo-200 active:scale-90 transition-all"
        >
          <div className="flex flex-col items-center">
            <Scan className="text-white w-8 h-8" />
            <span className="text-[8px] text-white font-bold mt-1 uppercase tracking-tighter">
              Absen
            </span>
          </div>
        </button> */}
      </div>
    </>
  );
}
