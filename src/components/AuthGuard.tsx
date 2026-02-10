"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const path = pathname;

      // 1. Tentukan kategori halaman
      const isPublicPath = path === "/login" || path === "/register";
      // Menggunakan .startsWith untuk mengizinkan rute dinamis
      const isProtectedPath =
        path === "/" ||
        path.startsWith("/attendance") ||
        path.startsWith("/izin");

      console.log("GUARD CHECK:", { path, hasToken: !!token, isProtectedPath });

      if (!token && isProtectedPath) {
        // Kasus: Tidak login tapi akses halaman dalam
        console.log("GUARD: No token, redirect to login");
        setAuthorized(false);
        router.replace("/login");
      } else if (token && isPublicPath) {
        // Kasus: Sudah login tapi akses halaman login/regis
        console.log("GUARD: Already logged in, redirect to dashboard");
        router.replace("/");
      } else {
        // Kasus: Akses diizinkan
        console.log("GUARD: Access Granted");
        setAuthorized(true);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // JANGAN gunakan spinner jika sebenarnya user sudah authorized
  // Ini untuk mencegah 'flicker' yang membuat navigasi terasa gagal
  if (!authorized && !["/login", "/register"].includes(pathname)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Memeriksa Akses...</p>
      </div>
    );
  }

  return <>{children}</>;
}
