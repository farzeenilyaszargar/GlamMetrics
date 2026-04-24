const steps = [
  {
    title: "Upload or capture",
    description: "Take a photo or upload one in a few seconds.",
  },
  {
    title: "Get AI analysis",
    description: "Receive instant insights on angles, expressions, and balance.",
  },
  {
    title: "Apply recommendations",
    description: "Use clear suggestions to improve beauty and content decisions fast.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full px-4 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl rounded-3xl border border-[#ED2738]/20 bg-white p-7 pt-0 shadow-sm max-sm:p-5 max-sm:pt-0 sm:p-10">
        <h2 className="font-emilys-candy text-5xl leading-tight text-[#ED2738] max-sm:text-4xl sm:text-6xl">How it works</h2>

        <div className="mt-8 grid gap-4 max-sm:mt-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-[#ED2738]/20 bg-[#F7DBE2]/45 p-5 transition-colors hover:border-[#ED2738]/45 hover:bg-[#F7DBE2]/75 max-sm:p-4">
              <p className="text-sm font-semibold text-[#ED2738]">Step {index + 1}</p>
              <h3 className="mt-2 text-lg font-semibold text-black">{step.title}</h3>
              <p className="mt-2 text-sm text-black/75 sm:text-base">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
