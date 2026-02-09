import { ChevronLeft, Clock, Filter } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

const DUMMY_HISTORY = [
  {
    id: 1,
    date: "Senin, 9 Feb 2026",
    time: "07:15",
    status: "Hadir",
    subject: "Matematika",
  },
  {
    id: 2,
    date: "Jumat, 6 Feb 2026",
    time: "08:45",
    status: "Terlambat",
    subject: "Fisika",
  },
  {
    id: 3,
    date: "Kamis, 5 Feb 2026",
    time: "07:05",
    status: "Hadir",
    subject: "Matematika",
  },
  { id: 4, date: "Rabu, 4 Feb 2026", time: "-", status: "Sakit", subject: "-" },
];

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <div className="p-6 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-10">
        <Link
          href="/"
          className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-slate-800" />
        </Link>
        <h1 className="font-bold text-slate-800">Riwayat Presensi</h1>
        <button className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center">
          <Filter className="w-4 h-4 text-slate-800" />
        </button>
      </div>

      <div className="p-6 space-y-4">
        {DUMMY_HISTORY.map((item) => (
          <div
            key={item.id}
            className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between"
          >
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">{item.date}</h4>
              <p className="text-slate-400 text-[10px]">
                {item.subject !== "-"
                  ? `Mapel: ${item.subject}`
                  : "Tidak Mengajar"}
              </p>
              <div className="flex items-center gap-2 pt-1 text-slate-500 font-bold text-[10px]">
                <Clock className="w-3 h-3" /> {item.time}
              </div>
            </div>
            <div
              className={`px-4 py-2 rounded-2xl text-[10px] font-bold ${
                item.status === "Hadir"
                  ? "bg-green-50 text-green-600"
                  : item.status === "Terlambat"
                    ? "bg-orange-50 text-orange-600"
                    : "bg-red-50 text-red-600"
              }`}
            >
              {item.status}
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </main>
  );
}
