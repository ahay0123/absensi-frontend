"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import InteractiveMapPicker from "@/components/InteractiveMapPicker";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  MapPin,
  QrCode as QrCodeIcon,
  RefreshCcw,
} from "lucide-react";
import api from "@/lib/axios";
import { QRCodeSVG } from "qrcode.react";

export default function AdminRooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState({
    id: null,
    room_name: "",
    latitude: "",
    longitude: "",
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // QR Modal State
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [selectedQR, setSelectedQR] = useState<string>("");
  const [selectedRoomName, setSelectedRoomName] = useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [qrExpiresIn, setQrExpiresIn] = useState<number>(0);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/rooms`);
      setRooms(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setFormData({
      id: null,
      room_name: "",
      latitude: "-6.200000",
      longitude: "106.816666",
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (room: any) => {
    setModalMode("edit");
    setFormData({
      id: room.id,
      room_name: room.room_name,
      latitude: room.latitude,
      longitude: room.longitude,
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isQrOpen && selectedRoomId) {
      const fetchQR = async () => {
        try {
          const res = await api.get(
            `/admin/rooms/${selectedRoomId}/dynamic-qr`,
          );
          setSelectedQR(res.data.data.qr_payload);
          setQrExpiresIn(res.data.data.expires_in);
        } catch (err) {
          console.error("Gagal mengambil QR dinamis");
        }
      };

      fetchQR(); // Initial fetch
      interval = setInterval(() => {
        setQrExpiresIn((prev) => {
          if (prev <= 1) {
            fetchQR(); // Fetch new QR when expired
            return 0; // Will be immediately updated by fetchQR
          }
          return prev - 1;
        });
      }, 1000); // Countdown and fetch
    }
    return () => clearInterval(interval);
  }, [isQrOpen, selectedRoomId]);

  const openQrModal = (roomId: number, roomName: string) => {
    setSelectedRoomId(roomId);
    setSelectedRoomName(roomName);
    setIsQrOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    try {
      if (modalMode === "create") {
        await api.post("/admin/rooms", formData);
      } else {
        await api.put(`/admin/rooms/${formData.id}`, formData);
      }
      setIsModalOpen(false);
      fetchRooms();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      confirm(
        "Yakin ingin menghapus ruang ini? Menghapus ruang akan menghapus semua jadwal terkait!",
      )
    ) {
      try {
        await api.delete(`/admin/rooms/${id}`);
        fetchRooms();
      } catch (err: any) {
        alert(err.response?.data?.message || "Gagal menghapus");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Lokasi Ruang</h1>
          <p className="text-slate-500 mt-1 text-sm bg-white inline-block">
            Kelola ruang kelas dan koordinat presensi
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => (window.location.href = "/admin/rooms/all-qrs")}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-all flex items-center gap-2"
          >
            <QrCodeIcon className="w-5 h-5" /> Seluruh QR
          </button>
          <button
            onClick={openCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Tambah Ruang
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              Belum ada data ruang ditemukan.
            </div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                className="border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow group relative overflow-hidden bg-slate-50/50"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">
                        {room.room_name}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 capitalize bg-slate-200/50 px-2 py-0.5 rounded-full inline-block mt-1">
                        ID: {room.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(room)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors p-1.5 hover:bg-indigo-50 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-3 border border-slate-100 mb-4">
                  <p className="text-xs text-slate-500 font-medium">
                    Lat: <span className="text-slate-800">{room.latitude}</span>
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Lng:{" "}
                    <span className="text-slate-800">{room.longitude}</span>
                  </p>
                </div>

                <button
                  onClick={() => openQrModal(room.id, room.room_name)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  <QrCodeIcon className="w-4 h-4" /> Tampilkan QR
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-slideDown max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
              <h2 className="text-xl font-bold text-slate-800">
                {modalMode === "create" ? "Tambah Ruang Baru" : "Edit Ruang"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4 overflow-y-auto flex-1"
            >
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Nama Ruang / Kelas
                </label>
                <input
                  required
                  type="text"
                  value={formData.room_name}
                  onChange={(e) =>
                    setFormData({ ...formData, room_name: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Pilih Lokasi Ruang
                </label>
                <InteractiveMapPicker
                  initialLat={parseFloat(formData.latitude) || -6.2}
                  initialLong={parseFloat(formData.longitude) || 106.8}
                  onLocationSelect={(lat, long) => {
                    setFormData({
                      ...formData,
                      latitude: lat.toString(),
                      longitude: long.toString(),
                    });
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Latitude
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Longitude
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Simpan Ruang"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {isQrOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setIsQrOpen(false)}
        >
          <div
            className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-scaleIn text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-black text-2xl text-slate-800 mb-1">
              {selectedRoomName}
            </h3>
            <p className="text-slate-500 text-sm mb-8">
              Scan QR Code ini untuk absensi di ruangan {selectedRoomName}
            </p>

            <div className="bg-white p-4 rounded-3xl inline-block border-[8px] border-slate-100 shadow-inner mb-2 relative">
              {selectedQR ? (
                <>
                  <QRCodeSVG
                    value={selectedQR}
                    size={200}
                    bgColor={"#ffffff"}
                    fgColor={"#1e293b"}
                    level={"Q"}
                    includeMargin={false}
                  />
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 whitespace-nowrap">
                    <RefreshCcw className="w-3 h-3 animate-spin" /> Auto-refresh
                    in {qrExpiresIn}s
                  </div>
                </>
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center bg-slate-50 flex-col gap-2">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                  <p className="text-xs text-slate-400">Memuat QR...</p>
                </div>
              )}
            </div>

            <div className="mt-8">
              <button
                onClick={() => setIsQrOpen(false)}
                className="w-full py-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
