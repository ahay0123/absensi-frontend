"use client";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { usePathname } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { useEffect } from "react";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Daftar rute yang TIDAK boleh menampilkan BottomNav (Halaman Fullscreen / Panel dengan sidebar)
  const hideNavPaths = ["/login", "/register", "/presensi-guru", "/presensi", "/admin", "/kepala-sekolah"];

  // Cek apakah halaman saat ini harus menyembunyikan navigasi
  const shouldHideNav = hideNavPaths.some((path) => pathname.startsWith(path));

  // Handle Dark Mode
  useEffect(() => {
    const handleDarkMode = () => {
      const isDark = localStorage.getItem("dark_mode") === "true";
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    handleDarkMode();

    // Listen for custom event to trigger dark mode changes without reloading
    window.addEventListener('darkModeToggled', handleDarkMode);
    return () => window.removeEventListener('darkModeToggled', handleDarkMode);
  }, []);

  return (
    <html lang="id">
      <body className={`${jakarta.className} bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-900 dark:text-slate-100`}>
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
