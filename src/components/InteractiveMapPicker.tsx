"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  MapPin,
  Loader2,
  AlertCircle,
  Navigation,
  MapIcon,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface InteractiveMapPickerProps {
  onLocationSelect: (lat: number, long: number) => void;
  initialLat?: number;
  initialLong?: number;
  disabled?: boolean;
}

export default function InteractiveMapPicker({
  onLocationSelect,
  initialLat = -6.2088,
  initialLong = 106.8456,
  disabled = false,
}: InteractiveMapPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [selectedLat, setSelectedLat] = useState(initialLat);
  const [selectedLong, setSelectedLong] = useState(initialLong);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchAddress, setSearchAddress] = useState("");

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Create map
    const initialMap = L.map(mapContainer.current).setView(
      [selectedLat, selectedLong],
      18,
    );

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(initialMap);

    // Create custom marker icon
    const customIcon = L.divIcon({
      html: `
        <div class="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center cursor-pointer transform -translate-x-4 -translate-y-8">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      `,
      iconSize: [32, 32],
      className: "",
    });

    const newMarker = L.marker([selectedLat, selectedLong], {
      icon: customIcon,
      draggable: true,
    }).addTo(initialMap);

    // Handle marker drag
    newMarker.on("dragend", () => {
      const position = newMarker.getLatLng();
      setSelectedLat(parseFloat(position.lat.toFixed(6)));
      setSelectedLong(parseFloat(position.lng.toFixed(6)));
      onLocationSelect(
        parseFloat(position.lat.toFixed(6)),
        parseFloat(position.lng.toFixed(6)),
      );
      setErrorMsg(null);
    });

    markerRef.current = newMarker;
    map.current = initialMap;

    // Handle map click
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const newLat = parseFloat(lat.toFixed(6));
      const newLng = parseFloat(lng.toFixed(6));
      setSelectedLat(newLat);
      setSelectedLong(newLng);
      onLocationSelect(newLat, newLng);
      newMarker.setLatLng([newLat, newLng]);
      initialMap.setView([newLat, newLng], 18);
      setErrorMsg(null);
    };

    initialMap.on("click", handleMapClick);

    return () => {
      initialMap.off("click", handleMapClick);
    };
  }, []);

  // Update marker when coordinates change from outside
  useEffect(() => {
    if (map.current && markerRef.current) {
      markerRef.current.setLatLng([selectedLat, selectedLong]);
      map.current.setView([selectedLat, selectedLong], 18);
    }
  }, [selectedLat, selectedLong]);

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
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        setSelectedLat(lat);
        setSelectedLong(lng);
        if (map.current) {
          map.current.setView([lat, lng], 18);
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
        onLocationSelect(lat, lng);
        console.log("✅ Lokasi berhasil diambil:", { lat, lng });
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

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2 text-sm text-blue-700">
        <MapIcon className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">
            📍 Klik pada map untuk memilih lokasi ruang
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Anda juga bisa drag marker atau gunakan tombol GPS untuk lokasi
            akurat
          </p>
        </div>
      </div>

      {/* Interactive Map */}
      <div
        ref={mapContainer}
        className={`relative w-full h-80 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-lg ${
          disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
        }`}
        style={{
          backgroundColor: "#e5e7eb",
        }}
      />

      {/* Coordinate Display Overlay */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">
              Latitude
            </p>
            <p className="text-lg font-bold text-slate-800">
              {selectedLat.toFixed(6)}°
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">
              Longitude
            </p>
            <p className="text-lg font-bold text-slate-800">
              {selectedLong.toFixed(6)}°
            </p>
          </div>
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
            Mengambil Lokasi GPS...
          </>
        ) : (
          <>
            <Navigation className="w-4 h-4" />
            Gunakan Lokasi Saya Sekarang
          </>
        )}
      </button>

      {/* Manual Coordinate Input */}
      <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-200">
        <p className="text-xs font-bold text-slate-600 uppercase">
          Input Manual Koordinat
        </p>
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
              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 italic">
        💡 Presisi koordinat hingga 6 desimal untuk akurasi maksimal. Lokasi
        ditampilkan di peta OpenStreetMap yang selalu update.
      </p>
    </div>
  );
}
