"use client";
import { useParams } from "next/navigation";

export default function AbsensiPage() {
  const params = useParams();

  console.log("TEST: Komponen ini berhasil dirender!");
  console.log("ID yang terbaca:", params?.id);

  return (
    <div style={{ padding: "50px", textAlign: "center", background: "yellow" }}>
      <h1>HALAMAN ABSENSI BERHASIL TERBUKA</h1>
      <p>ID Jadwal: {params?.id}</p>
      <button onClick={() => window.location.reload()}>Refresh Halaman</button>
    </div>
  );
}
