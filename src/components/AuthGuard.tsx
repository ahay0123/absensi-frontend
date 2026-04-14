"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Public routes that don't require authentication
    const publicPaths = ["/login", "/register"];

    // Check if current path is public
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    // Get token from localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    console.log("🔐 AuthGuard Check:", { pathname, hasToken: !!token, isPublicPath });

    // If on public path, allow access immediately
    if (isPublicPath) {
      console.log("✅ Public path - allowing access");
      setIsChecking(false);
      return;
    }

    // If on protected path without token, redirect to login
    if (!token) {
      console.log("❌ No token found - redirecting to login");
      router.replace("/login");
      return;
    }

    // Has token and on protected path - allow access
    console.log("✅ Token found - allowing access");
    setIsChecking(false);
  }, [pathname, router]);

  // Show loader only while checking (not on public paths)
  const publicPaths = ["/login", "/register"];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  if (isChecking && !isPublicPath) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Memeriksa Akses...</p>
      </div>
    );
  }

  return <>{children}</>;
}
