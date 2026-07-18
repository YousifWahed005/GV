"use client";

import { useActionState, useRef, useState } from "react";
import { Camera, QrCode } from "lucide-react";
import { checkInRegistration, type ActionState } from "@/lib/actions";

const initialState: ActionState = { ok: false, message: "" };

export function CheckInForm() {
  const [state, action, pending] = useActionState(checkInRegistration, initialState);
  const [scanValue, setScanValue] = useState("");
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  async function startScanner() {
    const detectorClass = (window as unknown as { BarcodeDetector?: new (options: { formats: string[] }) => { detect: (video: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector;
    if (!detectorClass || !videoRef.current) return;
    setScanning(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    videoRef.current.srcObject = stream;
    await videoRef.current.play();
    const detector = new detectorClass({ formats: ["qr_code"] });
    let active = true;
    const tick = async () => {
      if (!videoRef.current) return;
      const codes = await detector.detect(videoRef.current);
      if (codes[0]?.rawValue) {
        setScanValue(codes[0].rawValue);
        stream.getTracks().forEach((track) => track.stop());
        setScanning(false);
        active = false;
        return;
      }
      if (active) window.setTimeout(tick, 500);
    };
    tick();
  }

  return (
    <form action={action} className="paint-card mx-auto max-w-xl rounded-lg p-6 shadow-neon">
      <QrCode className="mb-4 text-limeflash" size={44} />
      <h1 className="graffiti-title mb-5 text-5xl">Check-In</h1>
      <input
        className="field"
        name="referenceId"
        placeholder="GV-2026-0001"
        required
        value={scanValue}
        onChange={(event) => setScanValue(event.currentTarget.value)}
      />
      <button type="button" className="btn-secondary mt-3 w-full" onClick={startScanner}>
        <Camera size={18} /> Scan QR
      </button>
      <video ref={videoRef} className={`mt-3 aspect-video w-full rounded-md object-cover ${scanning ? "block" : "hidden"}`} muted />
      <button className="btn-primary mt-4 w-full" disabled={pending}>
        {pending ? "Checking..." : "Check In Guest"}
      </button>
      {state.message && (
        <p className={`mt-4 rounded-md p-3 font-bold ${state.ok ? "bg-limeflash/10 text-limeflash" : "bg-hotpink/10 text-hotpink"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
