"use client";

import React, { useEffect, useRef, useState } from 'react';
import ScannerHeader from '@/components/scanner/ScannerHeader';
import ScannerOverlay from '@/components/scanner/ScannerOverlay';
import ScannerActions from '@/components/scanner/ScannerActions';
import ScannerNav from '@/components/scanner/ScannerNav';

export default function ScannerPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isFlashOn, setIsFlashOn] = useState(false);

    useEffect(() => {
        async function startCamera() {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
            }
        }

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const toggleFlashlight = async () => {
        if (!stream) return;

        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities() as any;

        if (capabilities.torch) {
            try {
                await track.applyConstraints({
                    advanced: [{ torch: !isFlashOn }]
                } as any);
                setIsFlashOn(!isFlashOn);
            } catch (err) {
                console.error("Error toggling flashlight:", err);
            }
        } else {
            console.warn("Torch not supported on this device/browser");
        }
    };

    return (
        <main className="relative h-screen w-full flex flex-col items-center justify-center bg-black font-display antialiased overflow-hidden">
            {/* Real Camera Feed */}
            <div className="absolute inset-0 z-0">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-100"
                />
            </div>

            <ScannerHeader isFlashOn={isFlashOn} onToggleFlashlight={toggleFlashlight} />
            <ScannerOverlay />

            <div className="absolute bottom-10 left-0 right-0 z-50 flex flex-col items-center gap-6">
                <ScannerActions />
                <ScannerNav />
            </div>

            <div className="absolute bottom-1 w-32 h-1.5 bg-white/20 rounded-full left-1/2 -translate-x-1/2"></div>
        </main>
    );
}
