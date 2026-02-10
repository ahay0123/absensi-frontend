"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true); // Tambahkan state loading

  useEffect(() => {
    const checkAuth = () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const path = pathname;

      // Halaman yang butuh login
      const isProtectedPath =
        path === "/" ||
        path.startsWith("/presensi-guru") ||
        path.startsWith("/attendance") ||
        path.startsWith("/izin");

      if (!token && isProtectedPath) {
        // Jika tidak ada token dan mencoba masuk ke halaman dalam -> ke Login
        setAuthorized(false);
        router.replace("/login");
      } else {
        // Jika ada token, atau sedang di halaman publik -> IZINKAN
        // KITA HAPUS router.replace("/") DI SINI agar tidak ada "mental" balik
        setAuthorized(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  // Jika masih loading atau belum authorized (dan bukan public path), tampilkan loader
  if ((loading || !authorized) && !["/login", "/register"].includes(pathname)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Memeriksa Akses...</p>
      </div>
    );
  }

  return <>{children}</>;
}
