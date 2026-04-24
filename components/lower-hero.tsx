import Link from "next/link";

export default function LowerHero() {
  return (
    <section className="w-full px-4 pb-8 sm:px-8 lg:px-12">
      <div className="mx-auto grid w-full max-w-6xl gap-6 rounded-3xl border border-[#ED2738]/20 bg-white p-7 shadow-sm max-sm:p-5 md:grid-cols-[1.2fr_0.8fr] md:items-center sm:p-10">
        <div>
          <h2 className="font-emilys-candy text-5xl leading-tight text-[#ED2738] max-sm:text-4xl sm:text-6xl">Ready for your best look?</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-black/80 max-sm:text-[15px] sm:text-lg">
            Get personalized face insights in seconds and turn every photo into a more confident result.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 max-sm:flex-col">
            <Link
              href="/#top"
              className="inline-flex items-center justify-center rounded-full border border-[#ED2738] bg-[#ED2738] px-6 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 hover:border-black hover:bg-black hover:text-[#F7DBE2] max-sm:w-full"
            >
              Start now
            </Link>
            <Link
              href="/#reviews"
              className="inline-flex items-center justify-center rounded-full border border-[#ED2738] bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:-translate-y-0.5 hover:bg-[#F7DBE2] hover:text-[#ED2738] max-sm:w-full"
            >
              See reviews
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-[#ED2738]/25 bg-[#F7DBE2]/55 p-5">
          <div className="rounded-xl border border-[#ED2738]/25 bg-white p-5">
            <p className="text-sm font-medium text-[#ED2738]">Fast. Private. Actionable.</p>
            <p className="mt-3 text-sm leading-relaxed text-black/75">
              Used by creators to improve expressions, framing, and confidence before posting.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
