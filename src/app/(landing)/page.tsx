"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  QrCode,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* ============== NAVIGATION ============== */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center">
                <QrCode size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">
                E-Presenti
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Fitur
              </a>
              <a
                href="#how-it-works"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cara Kerja
              </a>
              <a
                href="#benefits"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Manfaat
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium"
              >
                Daftar
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X size={24} className="text-slate-900" />
              ) : (
                <Menu size={24} className="text-slate-900" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-3 border-t border-slate-200">
              <a
                href="#features"
                className="block text-slate-600 hover:text-slate-900 py-2"
              >
                Fitur
              </a>
              <a
                href="#how-it-works"
                className="block text-slate-600 hover:text-slate-900 py-2"
              >
                Cara Kerja
              </a>
              <a
                href="#benefits"
                className="block text-slate-600 hover:text-slate-900 py-2"
              >
                Manfaat
              </a>
              <div className="flex gap-2 pt-2">
                <Link
                  href="/login"
                  className="flex-1 text-center px-4 py-2 text-slate-700"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg"
                >
                  Daftar
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ============== HERO SECTION ============== */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 -z-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-transparent rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/30 to-transparent rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
                <span className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-purple-700">
                  Sistem Absensi Modern
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Absensi Guru Digital dengan
                <span className="bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                  {" "}
                  QR Code
                </span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed">
                Sistem absensi terintegrasi untuk guru dan kepala sekolah.
                Absensi real-time dengan validasi QR code, geolokasi, dan
                dokumentasi foto.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium"
                >
                  Mulai Sekarang
                  <ArrowRight size={20} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Saya Sudah Terdaftar
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-8 border-t border-slate-200">
                <div>
                  <div className="text-2xl font-bold text-slate-900">100+</div>
                  <div className="text-sm text-slate-600">Sekolah Aktif</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">5000+</div>
                  <div className="text-sm text-slate-600">Guru Terdaftar</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">99.9%</div>
                  <div className="text-sm text-slate-600">Uptime</div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative h-80 md:h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-200/40 to-blue-200/40 rounded-2xl blur-2xl" />
              <div className="absolute inset-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-200/50 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <QrCode size={64} className="text-purple-600 mx-auto" />
                  <div className="space-y-2">
                    <p className="text-slate-900 font-semibold">Scan QR Code</p>
                    <p className="text-sm text-slate-600">
                      Absen dengan sekali scan
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== FEATURES SECTION ============== */}
      <section id="features" className="py-20 md:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Semua fitur yang Anda butuhkan untuk mengelola absensi guru dengan
              efisien
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center mb-4">
                <QrCode size={24} className="text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                QR Code Dinamis
              </h3>
              <p className="text-slate-600">
                Kode QR yang berubah setiap 45 detik mencegah penyalahgunaan dan
                manipulasi data.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center mb-4">
                <MapPin size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Validasi Geolokasi
              </h3>
              <p className="text-slate-600">
                Memastikan guru berada di lokasi sekolah dengan radius 50 meter
                menggunakan GPS.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle2 size={24} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Dokumentasi Foto
              </h3>
              <p className="text-slate-600">
                Selfie dan bukti kehadiran digital untuk audit trail yang
                lengkap dan transparan.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg flex items-center justify-center mb-4">
                <Clock size={24} className="text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Real-Time Tracking
              </h3>
              <p className="text-slate-600">
                Pantau kehadiran guru secara real-time dengan status dan
                notifikasi instan.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-50 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp size={24} className="text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Analytics & Laporan
              </h3>
              <p className="text-slate-600">
                Dashboard analitik lengkap dengan grafik dan ekspor laporan
                dalam berbagai format.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-lg flex items-center justify-center mb-4">
                <Users size={24} className="text-cyan-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Multi-Role Akses
              </h3>
              <p className="text-slate-600">
                Dashboard khusus untuk guru, admin, dan kepala sekolah dengan
                permission terpisah.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============== HOW IT WORKS SECTION ============== */}
      <section id="how-it-works" className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Cara Kerja
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Proses absensi yang sederhana dan cepat dalam 4 langkah
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: "Buka Aplikasi",
                description:
                  "Guru membuka aplikasi E-Presenti di smartphone mereka",
              },
              {
                step: 2,
                title: "Scan QR Code",
                description:
                  "Scan kode QR yang ditampilkan di layar guru atau papan di kelas",
              },
              {
                step: 3,
                title: "Validasi Lokasi",
                description:
                  "Sistem memvalidasi GPS dan mengambil foto selfie untuk bukti",
              },
              {
                step: 4,
                title: "Konfirmasi",
                description:
                  "Absensi berhasil tercatat dengan status real-time",
              },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="flex flex-col items-center text-center">
                  {/* Step Circle */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white font-bold text-xl mb-4 relative z-10">
                    {item.step}
                  </div>

                  {/* Connector */}
                  {idx < 3 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-full h-1 bg-gradient-to-r from-purple-300 to-purple-200" />
                  )}

                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== BENEFITS SECTION ============== */}
      <section id="benefits" className="py-20 md:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Manfaat untuk Sekolah Anda
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Tingkatkan efisiensi dan transparansi dalam manajemen kehadiran
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                benefit: "Efisiensi Waktu",
                description:
                  "Tidak perlu lagi absensi manual. Proses cepat kurang dari 30 detik per guru.",
              },
              {
                benefit: "Transparansi Penuh",
                description:
                  "Data kehadiran yang akurat dengan bukti foto dan lokasi GPS yang terekam.",
              },
              {
                benefit: "Akses Mudah",
                description:
                  "Dashboard intuitif dapat diakses dari mana saja, kapan saja melalui web dan mobile.",
              },
              {
                benefit: "Keamanan Data",
                description:
                  "Sistem terenkripsi dengan validasi HMAC dan backup otomatis setiap hari.",
              },
              {
                benefit: "Laporan Otomatis",
                description:
                  "Generate laporan kehadiran bulanan dengan satu klik, siap untuk kepala sekolah.",
              },
              {
                benefit: "Integrasi Seamless",
                description:
                  "Otomatis terhubung dengan jadwal mengajar dan data guru yang sudah ada.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 border border-slate-200"
              >
                <div className="flex gap-4">
                  <CheckCircle2
                    size={24}
                    className="text-purple-600 flex-shrink-0 mt-1"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {item.benefit}
                    </h3>
                    <p className="text-slate-600">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== CTA SECTION ============== */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-500 to-purple-400 -z-10" />
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Siap Meningkatkan Efisiensi Absensi Sekolah Anda?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan lebih dari 100 sekolah yang telah mempercayai
            E-Presenti untuk mengelola kehadiran guru mereka.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-lg hover:shadow-xl transition-all font-semibold"
            >
              Daftar Sekarang
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-semibold"
            >
              Masuk ke Akun
            </Link>
          </div>
        </div>
      </section>

      {/* ============== FOOTER ============== */}
      <footer className="bg-slate-900 text-slate-300 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center">
                  <QrCode size={20} className="text-white" />
                </div>
                <span className="text-lg font-bold text-white">E-Presenti</span>
              </div>
              <p className="text-sm">
                Sistem absensi guru digital yang aman, cepat, dan terintegrasi.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Produk</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Fitur
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-white transition-colors"
                  >
                    Cara Kerja
                  </a>
                </li>
                <li>
                  <a
                    href="#benefits"
                    className="hover:text-white transition-colors"
                  >
                    Manfaat
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-white mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Tentang Kami
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Kontak
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privasi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">
              &copy; 2026 E-Presenti. Semua hak cipta dilindungi.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                Twitter
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                LinkedIn
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
