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
    <div className="relative mx-auto w-full max-w-xl rounded-[2rem] border border-[#ED2738]/25 bg-[#F7DBE2]/65 p-6 shadow-sm sm:p-8">
      <div className="relative min-h-[320px] rounded-[1.5rem] border border-[#ED2738]/30 bg-white/85 p-6">
        <div className="absolute left-5 top-5 h-14 w-14 rounded-full border border-[#ED2738]/30 bg-[#F7DBE2]/70" />
        <div className="absolute right-6 top-7 h-8 w-24 rounded-full border border-[#ED2738]/35 bg-white" />
        <div className="absolute bottom-6 left-6 h-20 w-20 rounded-2xl border border-[#ED2738]/35 bg-[#F7DBE2]/80" />

        <div className="mx-auto mt-16 flex max-w-[280px] flex-col gap-4 rounded-2xl border border-[#ED2738]/25 bg-white p-5">
          <p className="font-stack-sans-headline text-[11px] uppercase tracking-[0.14em] text-[#ED2738]">Live Analysis</p>
          <div className="h-2.5 rounded-full bg-[#F7DBE2]">
            <div className="h-2.5 w-[82%] rounded-full bg-[#ED2738]" />
          </div>
          <p className="font-stack-sans-headline text-xs uppercase tracking-[0.12em] text-black/75">Expression Confidence 82%</p>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="w-full px-4 pb-16 pt-14 sm:px-8 lg:px-12">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
        <div className="text-center lg:text-left">
          <p className="inline-flex rounded-full border border-[#ED2738]/30 bg-[#F7DBE2] px-4 py-1 font-stack-sans-headline text-xs uppercase tracking-[0.2em] text-[#ED2738]">
            AI Beauty Intelligence
          </p>

          <h1 className="mt-7 leading-tight">
            <span className="font-stack-sans-headline text-4xl uppercase tracking-[0.08em] text-black sm:text-5xl">
              Unleash Your Inner
            </span>
            <span className="mt-3 block font-emilys-candy text-7xl leading-[0.95] text-[#ED2738] sm:text-8xl md:text-9xl">
              Glamour
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-black/80 lg:max-w-xl">
            GlamMetrics reveals the details behind your best angles and expressions so you can make confident beauty, style, and social content decisions.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <button className="inline-flex min-w-44 items-center justify-center rounded-full border border-[#ED2738] bg-[#ED2738] px-6 py-3 text-base font-medium text-white transition-transform hover:-translate-y-0.5 hover:border-black hover:bg-black hover:text-[#F7DBE2]">
              Take Photo
              <span className="text-black">
                <CameraIcon />
              </span>
            </button>

            <button className="inline-flex min-w-44 items-center justify-center rounded-full border border-[#ED2738] bg-white px-6 py-3 text-base font-medium text-black transition-transform hover:-translate-y-0.5 hover:border-[#ED2738] hover:bg-[#F7DBE2] hover:text-[#ED2738]">
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
