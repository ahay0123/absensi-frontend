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
      const publicPaths = ["/login", "/register"];
      const path = pathname.split("?")[0];

      // Cek apakah halaman saat ini adalah publik
      const isPublicPath = publicPaths.includes(path);

      if (!token && !isPublicPath) {
        // Jika tidak ada token dan bukan halaman login, tendang ke login
        setAuthorized(false);
        router.replace("/login"); // Gunakan replace agar tidak bisa 'back'
      } else if (token && isPublicPath) {
        // Jika sudah login tapi coba buka halaman login, lempar ke dashboard
        router.replace("/");
      } else {
        // Izinkan akses
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
