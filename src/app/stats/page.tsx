import { ArrowUpRight, CheckCircle, Clock, Calendar } from "lucide-react";

export default function StatsPage() {
  return (
    <main className="min-h-screen p-6 pb-28 bg-slate-50">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        Statistik Bulan Ini
      </h1>

      {/* Hero Card: Kehadiran Utama */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white mb-6 relative overflow-hidden shadow-xl shadow-indigo-200">
        <div className="relative z-10">
          <p className="text-indigo-100 text-sm font-medium">
            Persentase Kehadiran
          </p>
          <h2 className="text-5xl font-black mt-2">98.5%</h2>
          <p className="text-indigo-200 text-xs mt-4 flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4 text-green-300" />
            <span>2.1% lebih baik dari bulan lalu</span>
          </p>
        </div>
        {/* Dekorasi Aksen */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <CheckCircle className="text-green-500 w-6 h-6 mb-3" />
          <h4 className="text-2xl font-bold text-slate-800">20</h4>
          <p className="text-slate-400 text-[10px] font-bold uppercase">
            Hari Hadir
          </p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <Clock className="text-orange-500 w-6 h-6 mb-3" />
          <h4 className="text-2xl font-bold text-slate-800">2</h4>
          <p className="text-slate-400 text-[10px] font-bold uppercase">
            Terlambat
          </p>
        </div>
      </div>

      {/* Info Mingguan */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800">Aktivitas Mingguan</h3>
          <Calendar className="w-4 h-4 text-slate-300" />
        </div>
        <div className="flex items-end justify-between h-32 gap-2 px-2">
          {/* Dummy Bar Chart */}
          {[40, 70, 45, 90, 65].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className={`w-full rounded-t-lg transition-all duration-500 ${i === 3 ? "bg-indigo-600" : "bg-indigo-100"}`}
                style={{ height: `${height}%` }}
              ></div>
              <span className="text-[10px] font-bold text-slate-400">
                Min-{i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
