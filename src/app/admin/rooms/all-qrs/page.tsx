"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Loader2, ArrowLeft, RefreshCcw, QrCode as QrCodeIcon } from "lucide-react";
import api from "@/lib/axios";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

export default function AllQrsPage() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [qrExpiresIn, setQrExpiresIn] = useState<number>(30);

    const fetchAllDynamicQrs = async () => {
        try {
            const res = await api.get(`/admin/rooms/dynamic-qr/all`);
            setRooms(res.data.data);
            if (res.data.data.length > 0) {
                setQrExpiresIn(res.data.data[0].expires_in);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllDynamicQrs(); // Initial fetch
        const interval = setInterval(() => {
            setQrExpiresIn((prev) => {
                if (prev <= 1) {
                    fetchAllDynamicQrs(); // Fetch new QR when expired
                    return 0; // Will be immediately updated by fetchQR
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Link href="/admin/rooms" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <h1 className="text-2xl font-black text-slate-800">Seluruh QR Code Dinamis</h1>
                    </div>
                    <p className="text-slate-500 mt-1 text-sm bg-white inline-block ml-11">Menampilkan semua QR code aktif untuk absensi, auto-update.</p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4 animate-spin" /> Auto-refresh in {qrExpiresIn}s
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-8 min-h-[500px]">
                {loading && rooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-indigo-400 gap-3">
                        <Loader2 className="w-10 h-10 animate-spin" />
                        <p className="text-slate-500 font-medium">Memuat QR Code...</p>
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-3">
                        <QrCodeIcon className="w-12 h-12 opacity-50" />
                        Belum ada data ruang ditemukan.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {rooms.map((room, index) => (
                            <div key={index} className="flex flex-col items-center bg-slate-50 rounded-2xl p-6 border border-slate-100 transition-transform hover:-translate-y-1 hover:shadow-lg">
                                <h3 className="font-bold text-lg text-slate-800 mb-4">{room.room_name}</h3>
                                <div className="bg-white p-3 rounded-2xl shadow-inner mb-4 relative">
                                    <QRCodeSVG
                                        value={room.qr_payload}
                                        size={160}
                                        bgColor={"#ffffff"}
                                        fgColor={"#1e293b"}
                                        level={"Q"}
                                        includeMargin={false}
                                    />
                                    {qrExpiresIn === 0 && (
                                        <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center backdrop-blur-[1px]">
                                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 font-medium bg-white px-3 py-1 rounded-full border border-slate-200">ID: {room.room_id}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
