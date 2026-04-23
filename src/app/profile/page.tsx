"use client";
import { useState, useEffect, useRef } from "react";
import {
  LogOut,
  Shield,
  User,
  ChevronRight,
  X,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  BadgeCheck,
} from "lucide-react";
import api from "@/lib/axios";
import Alert, { useAlert } from "@/components/Alert";
import BottomNav from "@/components/BottomNav";

interface UserData {
  name?: string;
  email?: string;
  nip?: string;
  jabatan?: string;
  avatar?: string;
}

// ── Komponen Modal/Sheet Universal ─────────────────────────
function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Handle swipe down to close
  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    const diff = endY - startYRef.current;

    // Jika swipe down lebih dari 50px, close sheet
    if (diff > 50) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        ref={sheetRef}
        className="relative bg-white rounded-t-[2.5rem] shadow-2xl animate-slide-up flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Drag Handle & Header */}
        <div
          className="flex-shrink-0 p-6 pb-4"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4 cursor-grab active:cursor-grabbing" />
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center active:scale-90 transition-all"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-8">{children}</div>
      </div>
    </div>
  );
}

// ── Password Input dengan toggle show/hide ──────────────────
function PasswordInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-slate-50 rounded-2xl p-4 pr-12 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-600 transition-all disabled:opacity-50"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 active:scale-90 transition-all"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────
export default function ProfilePage() {
  const [user, setUser] = useState<UserData>({});
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const { alert, showAlert, hideAlert } = useAlert();

  // Change password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // Load user from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    } catch {
      /* ignore */
    }
  }, []);

  const openSheet = (name: string) => setActiveSheet(name);
  const closeSheet = () => {
    setActiveSheet(null);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // ── Logout ─────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // ── Ganti Password ─────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword)
      return showAlert("error", "Isi password lama terlebih dahulu");
    if (newPassword.length < 8)
      return showAlert("error", "Password baru minimal 8 karakter");
    if (newPassword !== confirmPassword)
      return showAlert("error", "Konfirmasi password tidak cocok");

    setPwLoading(true);
    try {
      await api.post("/change-password", {
        current_password: oldPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
      showAlert("success", "Password berhasil diubah!");
      setTimeout(closeSheet, 1500);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Gagal mengubah password. Coba lagi.";
      showAlert("error", msg);
    } finally {
      setPwLoading(false);
    }
  };

  const menuItems = [
    {
      name: "Informasi Pribadi",
      icon: User,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      sheet: "info",
    },
    {
      name: "Keamanan Akun",
      icon: Shield,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      sheet: "security",
    },
  ];

  // Avatar initial fallback
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "G";

  return (
    <main className="min-h-screen bg-slate-50 pb-28">
      {/* Alert */}
      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={hideAlert} />
      )}

      {/* ── Header Profil ───────────────────────────────── */}
      <div className="bg-white p-8 pt-12 rounded-b-[3rem] shadow-sm text-center border-b border-slate-100">
        <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-50 mx-auto mb-6 p-1 border-4 border-white shadow-xl relative">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="profile"
              className="w-full h-full object-cover rounded-[2.2rem]"
            />
          ) : (
            <div className="w-full h-full rounded-[2.2rem] bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-4xl font-black">{initial}</span>
            </div>
          )}
          <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          {user?.name || "Guru"}
        </h2>
        <p className="text-slate-400 text-sm mt-1 font-medium">
          NIP: {user?.nip || "-"}
        </p>
      </div>

      {/* ── Menu List ──────────────────────────────────── */}
      <div className="p-6 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => openSheet(item.sheet)}
            className="w-full bg-white p-5 rounded-[2rem] flex items-center justify-between border border-slate-100 shadow-sm active:scale-95 transition-all"
          >
            <div className="flex items-center gap-4 font-bold text-slate-700">
              <div
                className={`w-10 h-10 rounded-2xl ${item.bg} flex items-center justify-center`}
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <span className="text-sm tracking-tight">{item.name}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        ))}

        <button
          onClick={handleLogout}
          className="w-full bg-red-50 p-5 rounded-[2rem] flex items-center justify-center gap-3 text-red-600 font-bold active:scale-95 transition-all mt-6"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Keluar Aplikasi</span>
        </button>
      </div>

      {/* ── Bottom Sheets ──────────────────────────────── */}

      {/* Sheet: Informasi Pribadi */}
      <BottomSheet
        open={activeSheet === "info"}
        onClose={closeSheet}
        title="Informasi Pribadi"
      >
        <div className="space-y-4 pb-6">
          <InfoRow icon={User} label="Nama Lengkap" value={user?.name || "-"} />
          <InfoRow icon={Mail} label="Email" value={user?.email || "-"} />
          <InfoRow icon={BadgeCheck} label="NIP" value={user?.nip || "-"} />
        </div>
      </BottomSheet>

      {/* Sheet: Keamanan Akun */}
      <BottomSheet
        open={activeSheet === "security"}
        onClose={closeSheet}
        title="Ganti Password"
      >
        <form onSubmit={handleChangePassword} className="space-y-4 pb-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
              Password Lama
            </label>
            <PasswordInput
              value={oldPassword}
              onChange={setOldPassword}
              placeholder="Masukkan password lama"
              disabled={pwLoading}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
              Password Baru
            </label>
            <PasswordInput
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Minimal 8 karakter"
              disabled={pwLoading}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
              Konfirmasi Password Baru
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Ulangi password baru"
              disabled={pwLoading}
            />
          </div>
          <div className="sticky bottom-0 bg-white -mx-6 px-6 py-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={pwLoading}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pwLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                "Simpan Password"
              )}
            </button>
          </div>
        </form>
      </BottomSheet>

      <BottomNav />
    </main>
  );
}

// ── Helper Components ───────────────────────────────────────
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
        <Icon className="w-5 h-5 text-indigo-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
}
