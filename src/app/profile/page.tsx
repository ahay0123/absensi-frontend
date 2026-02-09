import {
  LogOut,
  Settings,
  Shield,
  User,
  ChevronRight,
  Bell,
} from "lucide-react";

export default function ProfilePage() {
  const menuItems = [
    { name: "Informasi Pribadi", icon: User, color: "text-indigo-600" },
    { name: "Notifikasi", icon: Bell, color: "text-blue-500" },
    { name: "Keamanan Akun", icon: Shield, color: "text-emerald-500" },
    { name: "Pengaturan", icon: Settings, color: "text-slate-500" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 pb-28">
      {/* Profil Header */}
      <div className="bg-white p-8 pt-12 rounded-b-[3rem] shadow-sm text-center border-b border-slate-100">
        <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-50 mx-auto mb-6 p-1 border-4 border-white shadow-xl relative">
          <img
            src="https://i.pravatar.cc/150?u=teacher"
            alt="profile"
            className="w-full h-full object-cover rounded-[2.2rem]"
          />
          <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Budi Santoso, M.Pd</h2>
        <p className="text-slate-400 text-sm mt-1 font-medium">
          NIP: 198203112009031002
        </p>
      </div>

      {/* Menu List */}
      <div className="p-6 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.name}
            className="w-full bg-white p-5 rounded-[2rem] flex items-center justify-between border border-slate-100 shadow-sm active:scale-95 transition-all"
          >
            <div className="flex items-center gap-4 font-bold text-slate-700">
              <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center">
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <span className="text-sm tracking-tight">{item.name}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        ))}

        <button className="w-full bg-red-50 p-5 rounded-[2rem] flex items-center justify-center gap-3 text-red-600 font-bold active:scale-95 transition-all mt-6">
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Keluar Aplikasi</span>
        </button>
      </div>
    </main>
  );
}
