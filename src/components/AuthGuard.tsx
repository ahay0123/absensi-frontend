"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Daftar halaman yang BOLEH diakses tanpa login
    const publicPaths = ["/login", "/register"];
    const path = pathname.split("?")[0];

    const token = localStorage.getItem("token");

    if (!token && !publicPaths.includes(path)) {
      // Jika tidak ada token dan mencoba akses halaman privat
      setAuthorized(false);
      router.push("/login");
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-400 font-medium animate-pulse">
          Memeriksa Akses...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
