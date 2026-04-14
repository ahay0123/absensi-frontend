import React, { useState } from "react";
import { MapPin, Loader2, AlertCircle } from "lucide-react";

interface MapPickerProps {
  onLocationSelect: (lat: number, long: number) => void;
  initialLat?: number;
  initialLong?: number;
  disabled?: boolean;
}

export default function MapPicker({
  onLocationSelect,
  initialLat = -6.2088,
  initialLong = 106.8456,
  disabled = false,
}: MapPickerProps) {
  const [loading, setLoading] = useState(false);
  const [selectedLat, setSelectedLat] = useState(initialLat);
  const [selectedLong, setSelectedLong] = useState(initialLong);
  const [zoomLevel, setZoomLevel] = useState(18);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCoordinateChange = (type: "lat" | "long", value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      if (type === "lat") {
        if (num >= -90 && num <= 90) {
          setSelectedLat(num);
          setErrorMsg(null);
          onLocationSelect(num, selectedLong);
        }
      } else {
        if (num >= -180 && num <= 180) {
          setSelectedLong(num);
          setErrorMsg(null);
          onLocationSelect(selectedLat, num);
        }
      }
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("❌ Browser tidak mendukung Geolocation");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const long = parseFloat(position.coords.longitude.toFixed(6));
        setSelectedLat(lat);
        setSelectedLong(long);
        setErrorMsg(null);
        console.log("✅ Lokasi berhasil diambil:", { lat, long });
        onLocationSelect(lat, long);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        let errorMessage = "❌ Gagal mengambil lokasi";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "❌ Izin lokasi ditolak. Aktifkan GPS di pengaturan browser.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "❌ Lokasi tidak tersedia. Pastikan GPS aktif.";
            break;
          case error.TIMEOUT:
            errorMessage =
              "❌ Timeout mencari lokasi. Coba lagi atau input manual.";
            break;
          default:
            errorMessage = `❌ Error: ${error.message || "Tidak diketahui"}`;
        }

        console.error("Geolocation error:", error.code, error.message);
        setErrorMsg(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const handleZoom = (direction: "in" | "out") => {
    if (direction === "in" && zoomLevel < 20) {
      setZoomLevel(zoomLevel + 1);
    } else if (direction === "out" && zoomLevel > 5) {
      setZoomLevel(zoomLevel - 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{errorMsg}</p>
            <p className="text-xs text-red-600 mt-1">
              💡 Gunakan input manual di bawah atau coba lagi dengan GPS aktif.
            </p>
          </div>
        </div>
      )}

      {/* Map Display */}
      <div
        className={`relative w-full h-60 sm:h-72 md:h-80 rounded-2xl overflow-hidden border-2 border-slate-200 bg-gradient-to-br from-blue-100 to-green-100 ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {/* SVG-based map visualization */}
        <svg viewBox="0 0 600 400" className="w-full h-full">
          <defs>
            <pattern
              id="grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="600" height="400" fill="url(#grid)" />
          <rect width="600" height="400" fill="#c5e1a5" opacity="0.2" />

          {/* Center point marker */}
          <circle
            cx="300"
            cy="200"
            r="8"
            fill="#ef4444"
            stroke="#fff"
            strokeWidth="2"
          />
          <circle
            cx="300"
            cy="200"
            r="12"
            fill="none"
            stroke="#ef4444"
            strokeWidth="1"
            opacity="0.5"
          />
          <circle
            cx="300"
            cy="200"
            r="16"
            fill="none"
            stroke="#ef4444"
            strokeWidth="1"
            opacity="0.3"
          />

          {/* Crosshair */}
          <line
            x1="300"
            y1="10"
            x2="300"
            y2="390"
            stroke="#cbd5e1"
            strokeWidth="0.5"
            strokeDasharray="5"
          />
          <line
            x1="10"
            y1="200"
            x2="590"
            y2="200"
            stroke="#cbd5e1"
            strokeWidth="0.5"
            strokeDasharray="5"
          />
        </svg>

        {/* Coordinate display */}
        <div className="absolute top-4 left-4 bg-white/95 px-4 py-3 rounded-xl shadow-lg text-sm font-bold text-slate-700 backdrop-blur-sm">
          <div className="text-xs text-slate-500 font-semibold mb-1">
            Koordinat
          </div>
          <div>Lat: {selectedLat.toFixed(6)}</div>
          <div>Long: {selectedLong.toFixed(6)}</div>
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-white/95 rounded-xl shadow-lg backdrop-blur-sm overflow-hidden">
          <button
            onClick={() => handleZoom("in")}
            disabled={zoomLevel >= 20}
            className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
          >
            +
          </button>
          <div className="w-10 h-px bg-slate-200" />
          <button
            onClick={() => handleZoom("out")}
            disabled={zoomLevel <= 5}
            className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
          >
            −
          </button>
        </div>

        {/* OpenStreetMap attribution */}
        <div className="absolute bottom-2 right-16 text-[10px] text-white bg-black/50 px-2 py-1 rounded z-10">
          © OpenStreetMap
        </div>
      </div>

      {/* Get Current Location Button */}
      <button
        type="button"
        onClick={handleGetCurrentLocation}
        disabled={disabled || loading}
        className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 disabled:bg-slate-100 text-indigo-700 disabled:text-slate-400 text-sm font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Mengambil Lokasi Sekarang...
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4" />
            Gunakan Lokasi Saya Sekarang
          </>
        )}
      </button>

      {/* Manual Coordinate Input */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2">
            Latitude (-90 hingga 90)
          </label>
          <input
            type="number"
            value={selectedLat}
            onChange={(e) => handleCoordinateChange("lat", e.target.value)}
            disabled={disabled}
            placeholder="Latitude"
            step="0.000001"
            min="-90"
            max="90"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2">
            Longitude (-180 hingga 180)
          </label>
          <input
            type="number"
            value={selectedLong}
            onChange={(e) => handleCoordinateChange("long", e.target.value)}
            disabled={disabled}
            placeholder="Longitude"
            step="0.000001"
            min="-180"
            max="180"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <p className="text-xs text-slate-500 italic">
        💡 Gunakan tombol "Gunakan Lokasi Saya Sekarang" untuk mengambil lokasi
        GPS saat ini, atau masukkan koordinat secara manual dengan presisi
        hingga 6 desimal.
      </p>
    </div>
  );
}
