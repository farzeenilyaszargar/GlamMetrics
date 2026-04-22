import Image from "next/image";

export default function Hero() {
  return (
    <section className="w-full px-4 pb-16 pt-12 sm:px-8 lg:px-12">
      <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="text-center lg:text-left">
          <p className="inline-flex rounded-full border px-4 py-1 font-stack-sans-headline text-xs uppercase tracking-[0.2em]">
            AI Beauty Intelligence
          </p>

          <h1 className="mt-7 font-emilys-candy text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
            Unleash Your Inner Glamour
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed lg:mx-0">
            GlamMetrics reveals the details behind your best angles and expressions so you can make confident beauty, style, and social content decisions.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <button className="inline-flex min-w-44 items-center justify-center rounded-full border px-6 py-3 text-base font-medium transition-transform hover:-translate-y-0.5">
              Take Photo
              <Image
                src="/camera-icon.svg"
                alt="Camera Icon"
                width={20}
                height={20}
                className="ml-2"
              />
            </button>

            <button className="inline-flex min-w-44 items-center justify-center rounded-full border px-6 py-3 text-base font-medium transition-transform hover:-translate-y-0.5">
              Upload Photo
              <Image
                src="/camera-icon.svg"
                alt="Camera Icon"
                width={20}
                height={20}
                className="ml-2"
              />
            </button>
          </div>
        </div>

        <div className="rounded-3xl border p-8 shadow-sm">
          <h2 className="font-stack-sans-headline text-sm uppercase tracking-[0.16em]">
            Why GlamMetrics
          </h2>

          <ul className="mt-6 space-y-5 text-base leading-relaxed">
            <li className="rounded-2xl border p-4">Precision face analysis tuned for beauty and style outcomes.</li>
            <li className="rounded-2xl border p-4">Fast, camera-ready suggestions in a polished mobile-friendly flow.</li>
            <li className="rounded-2xl border p-4">Private and intuitive experience designed for everyday creators.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
