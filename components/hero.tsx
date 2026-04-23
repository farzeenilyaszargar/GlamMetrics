"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { setPendingAnalysisImage } from "@/lib/analysis-session";
import { addUserHistory } from "@/lib/user-profile-store";

function CameraIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="ml-2 h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 8h3l1.6-2h6.8L17 8h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" />
      <circle cx="12" cy="14" r="3.5" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="ml-2 h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 15V4" />
      <path d="m8.5 7.5 3.5-3.5 3.5 3.5" />
      <path d="M4 15.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2.5" />
    </svg>
  );
}

function HeroVisual() {
  return (
    <div className="invisible mx-auto h-full w-full rounded-2xl" aria-hidden="true">
    </div>
  );
}

export default function Hero() {
  const router = useRouter();
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const logAnalysisAction = (action: string) => {
    if (!auth?.currentUser) return;
    addUserHistory(auth.currentUser.uid, action);
  };

  const stopCamera = () => {
    const stream = cameraStreamRef.current;
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async () => {
    setCameraLoading(true);
    setCameraError(null);
    setCapturedImage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      });

      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCameraError("Camera access was denied or unavailable. Please allow permission and try again.");
    } finally {
      setCameraLoading(false);
    }
  };

  const closeCameraOverlay = () => {
    setCameraOpen(false);
    setCameraLoading(false);
    setCameraError(null);
    setCapturedImage(null);
    stopCamera();
  };

  useEffect(() => {
    if (!cameraOpen) return;
    void startCamera();
    return () => stopCamera();
  }, [cameraOpen]);

  const openCameraOverlay = () => {
    logAnalysisAction("Clicked Take Photo");
    setCameraOpen(true);
  };

  const downscaleImageFromCanvas = (canvas: HTMLCanvasElement) =>
    canvas.toDataURL("image/jpeg", 0.92);

  const captureFromCamera = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError("Camera is not ready yet. Please wait a second and try again.");
      return;
    }

    const maxWidth = 1280;
    const sourceWidth = video.videoWidth;
    const sourceHeight = video.videoHeight;
    const ratio = Math.min(1, maxWidth / sourceWidth);

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(sourceWidth * ratio);
    canvas.height = Math.round(sourceHeight * ratio);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      setCameraError("Could not process the captured image.");
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const nextImage = downscaleImageFromCanvas(canvas);
    setCapturedImage(nextImage);
    stopCamera();
  };

  const useCapturedImage = () => {
    if (!capturedImage) return;
    setPendingAnalysisImage(capturedImage, "camera");
    closeCameraOverlay();
    router.push("/analysis");
  };

  const readFileAsImageDataUrl = async (file: File) => {
    const imageBitmap = await createImageBitmap(file);
    const maxWidth = 1400;
    const ratio = Math.min(1, maxWidth / imageBitmap.width);

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(imageBitmap.width * ratio);
    canvas.height = Math.round(imageBitmap.height * ratio);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not prepare image.");
    }

    ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
    imageBitmap.close();
    return canvas.toDataURL("image/jpeg", 0.92);
  };

  const handleUploadPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    logAnalysisAction("Clicked Upload Photo");

    try {
      const imageDataUrl = await readFileAsImageDataUrl(file);
      setPendingAnalysisImage(imageDataUrl, "upload");
      router.push("/analysis");
    } catch {
      alert("Could not read this image. Please upload a valid JPG or PNG file.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <>
      <section
        id="hero"
        className="w-full bg-[url('/images/bg.png')] bg-cover bg-center bg-no-repeat px-4 py-30 pt-14 sm:px-8 lg:px-12"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <div className="text-center lg:text-left">
            <h1 className="leading-tight">
              <span className="font-stack-sans-headline text-3xl uppercase tracking-[0.08em] text-black sm:text-4xl">
                Unleash Your Inner
              </span>
              <span className="mt-3 block font-emilys-candy text-7xl leading-[0.95] text-[#ED2738] sm:text-8xl md:text-9xl">
                Glamour
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-relaxed text-black/75 lg:max-w-xl">
              GlamMetrics helps you find your best angles and expressions for faster, more confident beauty and content decisions.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <button
                onClick={openCameraOverlay}
                className="inline-flex min-w-44 items-center justify-center rounded-full border border-[#ED2738] bg-[#ED2738] px-6 py-3 text-base font-medium text-white transition-transform hover:-translate-y-0.5 hover:border-[#c61f2f] hover:bg-[#c61f2f] hover:text-white"
              >
                Take Photo
                <span className="text-white">
                  <CameraIcon />
                </span>
              </button>

              <button
                onClick={() => uploadInputRef.current?.click()}
                className="inline-flex min-w-44 items-center justify-center rounded-full border border-[#ED2738] bg-white px-6 py-3 text-base font-medium text-black transition-transform hover:-translate-y-0.5 hover:border-[#ED2738] hover:bg-[#F7DBE2] hover:text-[#ED2738]"
              >
                Upload Photo
                <span className="text-black">
                  <UploadIcon />
                </span>
              </button>
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleUploadPhoto}
              />
            </div>
          </div>

          <HeroVisual />
        </div>
      </section>

      {cameraOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-[#ED2738]/30 bg-white p-5 shadow-[0_20px_70px_rgba(0,0,0,0.25)] sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black">Take Photo</h2>
              <button
                type="button"
                onClick={closeCameraOverlay}
                className="rounded-md border border-black/15 px-3 py-1 text-sm text-black/80 hover:bg-black hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#ED2738]/20 bg-black">
              {capturedImage ? (
                <img src={capturedImage} alt="Captured preview" className="h-[320px] w-full object-cover sm:h-[420px]" />
              ) : (
                <video ref={videoRef} playsInline muted className="h-[320px] w-full object-cover sm:h-[420px]" />
              )}
            </div>

            {cameraLoading ? <p className="mt-3 text-sm text-black/70">Requesting camera permission...</p> : null}
            {cameraError ? <p className="mt-3 text-sm text-[#b42318]">{cameraError}</p> : null}

            <div className="mt-4 flex flex-wrap gap-3">
              {!capturedImage ? (
                <button
                  type="button"
                  onClick={captureFromCamera}
                  className="rounded-full border border-[#ED2738] bg-[#ED2738] px-5 py-2 text-sm font-medium text-white hover:bg-[#c61f2f]"
                >
                  Capture
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={useCapturedImage}
                    className="rounded-full border border-[#ED2738] bg-[#ED2738] px-5 py-2 text-sm font-medium text-white hover:bg-[#c61f2f]"
                  >
                    Use this photo
                  </button>
                  <button
                    type="button"
                    onClick={() => void startCamera()}
                    className="rounded-full border border-black/20 bg-white px-5 py-2 text-sm font-medium text-black hover:bg-[#F7DBE2]"
                  >
                    Retake
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
