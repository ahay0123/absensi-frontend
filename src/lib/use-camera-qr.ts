/**
 * QR Scanner & Camera Hook
 * Proper cleanup, error handling, dan resource management
 */

import { useEffect, useRef, useCallback, useState } from "react";

interface ICameraState {
  isActive: boolean;
  hasPermission: boolean;
  error?: string;
}

/**
 * Hook untuk manage camera lifecycle
 * Clean startup & proper cleanup
 */
export function useCamera(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [cameraState, setCameraState] = useState<ICameraState>({
    isActive: false,
    hasPermission: true,
  });

  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      console.log("📷 [Camera] Requesting camera access...");

      // Stop existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => {
          console.error("❌ [Camera] Failed to play video:", err);
        });
      }

      setCameraState({
        isActive: true,
        hasPermission: true,
      });

      console.log("✅ [Camera] Started successfully");
      return stream;
    } catch (err: any) {
      console.error("❌ [Camera] Error:", err);

      const errorMessage =
        err.name === "NotAllowedError"
          ? "Izin kamera ditolak. Aktifkan di browser settings."
          : err.name === "NotFoundError"
            ? "Kamera tidak ditemukan di device."
            : err.name === "NotReadableError"
              ? "Kamera sedang digunakan aplikasi lain."
              : `Gagal mengakses kamera: ${err.message}`;

      setCameraState({
        isActive: false,
        hasPermission: err.name !== "NotAllowedError",
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }
  }, [videoRef]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      console.log("📷 [Camera] Stopping...");
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("  - Stopped track:", track.kind);
      });
      streamRef.current = null;

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setCameraState({
        isActive: false,
        hasPermission: true,
      });

      console.log("✅ [Camera] Stopped");
    }
  }, [videoRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    startCamera,
    stopCamera,
    cameraState,
    streamRef,
  };
}

/**
 * Hook untuk QR code scanner initialization & lifecycle
 * Proper cleanup untuk avoid memory leaks
 */
export function useQRScanner(
  containerId: string,
  onScanSuccess: (decodedText: string) => void,
  onScanError?: (error: any) => void,
) {
  const scannerRef = useRef<any>(null);
  const isInitializingRef = useRef(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const initQRScanner = useCallback(async () => {
    // Prevent multiple initialization
    if (isInitializingRef.current) {
      console.warn("⚠️ [QR Scanner] Already initializing, skipping...");
      return;
    }

    isInitializingRef.current = true;

    try {
      console.log("📱 [QR Scanner] Initializing...");

      // Optional: Check kalau container exist
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Container #${containerId} tidak ditemukan`);
      }

      // Dynamically import untuk reduce bundle size
      const { Html5QrcodeScanner } = await import("html5-qrcode");

      // Clear any existing scanner
      if (scannerRef.current) {
        try {
          await scannerRef.current.clear();
        } catch (e) {
          console.warn("⚠️ [QR Scanner] Error clearing old scanner:", e);
        }
      }

      // Create scanner instance
      scannerRef.current = new Html5QrcodeScanner(
        containerId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        false, // verbose logging disabled
      );

      // Render scanner
      await scannerRef.current.render(
        (decodedText: string) => {
          console.log("✅ [QR Scanner] QR Code scanned:", decodedText);
          setScanError(null);
          onScanSuccess(decodedText);
        },
        (error: any) => {
          // Suppress frequent scanning errors
          // Only log significant errors
          if (error && !error.message?.includes("NotFoundException")) {
            console.debug("📱 [QR Scanner] Scanning...", error?.message);
          }
          onScanError?.(error);
        },
      );

      setIsScanning(true);
      console.log("✅ [QR Scanner] Initialized successfully");
    } catch (error: any) {
      console.error("❌ [QR Scanner] Initialization error:", error);

      const errorMessage =
        error?.message || "Gagal menginisialisasi QR scanner";

      setScanError(errorMessage);
      setIsScanning(false);

      throw new Error(errorMessage);
    } finally {
      isInitializingRef.current = false;
    }
  }, [containerId, onScanSuccess, onScanError]);

  const stopQRScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        console.log("📱 [QR Scanner] Stopping...");

        // Properly stop scanner
        if (typeof scannerRef.current.clear === "function") {
          await scannerRef.current.clear();
        }

        scannerRef.current = null;
        setIsScanning(false);
        console.log("✅ [QR Scanner] Stopped");
      } catch (error) {
        console.warn("⚠️ [QR Scanner] Error stopping scanner:", error);
      }
    }
  }, []);

  const pauseQRScanner = useCallback(async () => {
    if (scannerRef.current?.pause) {
      try {
        await scannerRef.current.pause(true);
        console.log("⏸️ [QR Scanner] Paused");
      } catch (error) {
        console.warn("⚠️ [QR Scanner] Error pausing:", error);
      }
    }
  }, []);

  const resumeQRScanner = useCallback(async () => {
    if (scannerRef.current?.resume) {
      try {
        await scannerRef.current.resume();
        console.log("▶️ [QR Scanner] Resumed");
      } catch (error) {
        console.warn("⚠️ [QR Scanner] Error resuming:", error);
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopQRScanner();
    };
  }, [stopQRScanner]);

  return {
    initQRScanner,
    stopQRScanner,
    pauseQRScanner,
    resumeQRScanner,
    isScanning,
    scanError,
    scannerRef,
  };
}

/**
 * Hook untuk canvas/photo capture
 * Proper blob conversion dengan validation
 */
export function usePhotoCaptureCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  videoRef: React.RefObject<HTMLVideoElement | null>,
) {
  const [capturedPhoto, setCapturedPhoto] = useState<Blob | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const capturePhoto = useCallback(async (): Promise<Blob | null> => {
    try {
      if (!canvasRef.current || !videoRef.current) {
        throw new Error("Canvas or video element tidak tersedia");
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error("Video belum siap - tunggu sebentar");
      }

      // Set canvas dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Get context dan draw image dengan mirror effect (selfie mode)
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Canvas context tidak tersedia");
      }

      context.scale(-1, 1);
      context.drawImage(video, -canvas.width, 0);

      console.log("📸 [Photo] Captured - converting to blob...");

      // Convert canvas to blob
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log("✅ [Photo] Blob created:", {
                size: blob.size,
                type: blob.type,
              });
              setCapturedPhoto(blob);
              setPhotoError(null);
              resolve(blob);
            } else {
              reject(new Error("Gagal convert canvas ke blob"));
            }
          },
          "image/jpeg",
          0.8, // Quality: 80%
        );
      });
    } catch (error: any) {
      const message = error?.message || "Gagal mengambil foto";
      console.error("❌ [Photo] Capture error:", error);
      setPhotoError(message);
      throw new Error(message);
    }
  }, [canvasRef, videoRef]);

  const resetPhoto = useCallback(() => {
    setCapturedPhoto(null);
    setPhotoError(null);
  }, []);

  return {
    capturePhoto,
    resetPhoto,
    capturedPhoto,
    photoError,
  };
}

/**
 * Utility function untuk validate photo size
 */
export function validatePhotoSize(
  blob: Blob,
  maxSize: number = 5 * 1024 * 1024, // 5MB default
): { valid: boolean; message?: string } {
  if (blob.size > maxSize) {
    const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);
    const maxMB = (maxSize / (1024 * 1024)).toFixed(2);

    return {
      valid: false,
      message: `Ukuran foto terlalu besar (${sizeMB}MB > ${maxMB}MB)`,
    };
  }

  return { valid: true };
}
