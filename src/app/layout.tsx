"use client";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { usePathname } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Perbaikan: Cek apakah path dimulai dengan /absensi atau /presensi
  const isAbsensiPage =
    pathname.startsWith("/absensi") || pathname.startsWith("/presensi");

  return (
    <html lang="id">
      <body className={`${jakarta.className} bg-slate-50`}>
        <AuthGuard>
          {children}
          {/* Navigasi hanya muncul jika BUKAN di halaman kamera */}
          {!isAbsensiPage && <BottomNav />}
        </AuthGuard>
      </body>
    </html>
  );
}
