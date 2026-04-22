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

export default function Hero() {
  return (
    <section className="w-full px-4 pb-16 pt-14 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center text-center">
        <p className="inline-flex rounded-full border px-4 py-1 font-stack-sans-headline text-xs uppercase tracking-[0.2em]">
          AI Beauty Intelligence
        </p>

        <h1 className="mt-7 max-w-4xl leading-tight">
          <span className="font-stack-sans-headline text-4xl uppercase tracking-[0.08em] sm:text-5xl">
            Unleash Your Inner
          </span>
          <span className="mt-3 block font-emilys-candy text-7xl leading-[0.95] sm:text-8xl md:text-9xl">
            Glamour
          </span>
        </h1>

        <p className="mt-7 max-w-3xl text-lg leading-relaxed">
          GlamMetrics reveals the details behind your best angles and expressions so you can make confident beauty, style, and social content decisions.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button className="inline-flex min-w-44 items-center justify-center rounded-full border px-6 py-3 text-base font-medium transition-transform hover:-translate-y-0.5">
            Take Photo
            <span className="text-black">
              <CameraIcon />
            </span>
          </button>

          <button className="inline-flex min-w-44 items-center justify-center rounded-full border px-6 py-3 text-base font-medium transition-transform hover:-translate-y-0.5">
            Upload Photo
            <span className="text-black">
              <UploadIcon />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
