"use client";
import React, { useEffect, useState, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  Loader2,
  Save,
  School,
  MapPin,
  Mail,
  Phone,
  Hash,
  UploadCloud,
  ImageIcon,
} from "lucide-react";
import MapPicker from "@/components/MapPicker";
import api from "@/lib/axios";

export default function AdminSchoolProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    npsn: "",
    address: "",
    email: "",
    phone: "",
    latitude: "",
    longitude: "",
    radius_meters: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/admin/school-profile");
        if (res.data.data) {
          setFormData({
            name: res.data.data.name || "",
            npsn: res.data.data.npsn || "",
            address: res.data.data.address || "",
            email: res.data.data.email || "",
            phone: res.data.data.phone || "",
            latitude: res.data.data.latitude || "",
            longitude: res.data.data.longitude || "",
            radius_meters: res.data.data.radius_meters || "50",
          });
          if (res.data.data.logo_url) setLogoPreview(res.data.data.logo_url);
        }
      } catch (err) {
        console.error("Gagal load profil", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, (formData as any)[key]);
    });

    if (logoFile) {
      data.append("logo", logoFile);
    }

    try {
      const res = await api.post("/admin/school-profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccessMsg(res.data.message);
      if (res.data.data.logo_url) setLogoPreview(res.data.data.logo_url);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Gagal menyimpan profil.");
    } finally {
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Profil Sekolah</h1>
          <p className="text-slate-500 mt-1 text-sm bg-white inline-block">
            Kelola identitas, kontak, dan logo sekolah
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6"
          >
            {successMsg && (
              <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-100">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-bold border border-red-100">
                {errorMsg}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <School className="w-5 h-5 text-indigo-500" /> Identitas Sekolah
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Nama Sekolah
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" /> NPSN
                  </label>
                  <input
                    type="text"
                    value={formData.npsn}
                    onChange={(e) =>
                      setFormData({ ...formData, npsn: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 mt-6">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <MapPin className="w-5 h-5 text-indigo-500" /> Informasi Kontak
                & Alamat
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Alamat Lengkap
                  </label>
                  <textarea
                    rows={3}
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all shadow-inner resize-none"
                  ></textarea>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email Sekolah
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Telepon
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 mt-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-500" /> Konfigurasi GPS
                  Induk
                </h3>
                <span className="text-xs font-medium text-slate-400">
                  Opsional jika presensi berbasis ruang map
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4" /> Pilih Lokasi Sekolah
                  </label>
                  <MapPicker
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Latitude
                    </label>
                    <input
                      type="text"
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData({ ...formData, latitude: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Longitude
                    </label>
                    <input
                      type="text"
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData({ ...formData, longitude: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Radius Absen (Meter)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={5000}
                      value={formData.radius_meters}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          radius_meters: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-200 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 w-full sm:w-auto justify-center"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Image Upload */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sticky top-8">
            <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 block">
              Logo Sekolah
            </h3>

            <div className="flex flex-col items-center">
              <div className="w-40 h-40 bg-slate-50 border-4 border border-dashed border-slate-200 rounded-3xl flex items-center justify-center overflow-hidden mb-6 relative group">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Belum Ada Logo
                    </span>
                  </div>
                )}

                {/* Hover Overlay */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-indigo-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
                >
                  <UploadCloud className="w-8 h-8 mb-2" />
                  <span className="text-xs font-bold">Ubah Gambar</span>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-colors border-dashed text-center"
              >
                Pilih File Gambar (Maks 2MB)
              </button>
              <p className="text-[10px] items-center text-slate-400 mt-3 text-center w-full">
                Format didukung: PNG, JPG, SVG.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
