"use client";

import { auth } from "@/lib/firebase";
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
  const handleTakePhoto = () => {
    if (auth?.currentUser) {
      addUserHistory(auth.currentUser.uid, "Clicked Take Photo");
    }
  };

  const handleUploadPhoto = () => {
    if (auth?.currentUser) {
      addUserHistory(auth.currentUser.uid, "Clicked Upload Photo");
    }
  };

  return (
    <section
      id="hero"
      className="w-full bg-[url('/images/bg.png')] bg-cover bg-center bg-no-repeat px-4 pt-14 py-30 sm:px-8 lg:px-12"
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
              onClick={handleTakePhoto}
              className="inline-flex min-w-44 items-center justify-center rounded-full border border-[#ED2738] bg-[#ED2738] px-6 py-3 text-base font-medium text-white transition-transform hover:-translate-y-0.5 hover:border-[#c61f2f] hover:bg-[#c61f2f] hover:text-white"
            >
              Take Photo
              <span className="text-white">
                <CameraIcon />
              </span>
            </button>

            <button
              onClick={handleUploadPhoto}
              className="inline-flex min-w-44 items-center justify-center rounded-full border border-[#ED2738] bg-white px-6 py-3 text-base font-medium text-black transition-transform hover:-translate-y-0.5 hover:border-[#ED2738] hover:bg-[#F7DBE2] hover:text-[#ED2738]"
            >
              Upload Photo
              <span className="text-black">
                <UploadIcon />
              </span>
            </button>
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}
