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

  // Daftar rute yang TIDAK boleh menampilkan BottomNav (Halaman Fullscreen)
  const hideNavPaths = ["/login", "/register", "/presensi-guru", "/presensi"];

  // Cek apakah halaman saat ini harus menyembunyikan navigasi
  const shouldHideNav = hideNavPaths.some((path) => pathname.startsWith(path));

  return (
    <html lang="id">
      <body className={`${jakarta.className} bg-slate-50 text-slate-900`}>
        <AuthGuard>
          {/* Main Content */}
          <div className="min-h-screen">{children}</div>

          {/* Navigasi bawah hanya muncul jika bukan halaman fullscreen */}
          {!shouldHideNav && (
            <div className="fixed bottom-0 left-0 right-0 z-50">
              <BottomNav />
            </div>
          )}
        </AuthGuard>
      </body>
    </html>
  );
}
