const featureItems = [
  {
    title: "Facial Symmetry Insights",
    description:
      "Understand proportions and balance with clear, practical breakdowns tailored to beauty goals.",
  },
  {
    title: "Expression Intelligence",
    description:
      "See how your expressions read on camera and identify the most flattering, authentic looks.",
  },
  {
    title: "Style-Ready Recommendations",
    description:
      "Get targeted suggestions for makeup, framing, and content styling based on your analysis.",
  },
];

export default function Features() {
  return (
    <section className="w-full px-4 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <p className="font-stack-sans-headline text-xs uppercase tracking-[0.2em]">Features</p>
        <h2 className="mt-4 font-emilys-candy text-4xl sm:text-5xl">Everything You Need to Glow Smarter</h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {featureItems.map((item) => (
            <article key={item.title} className="rounded-3xl border p-6 shadow-sm">
              <h3 className="font-stack-sans-headline text-sm uppercase tracking-[0.12em]">{item.title}</h3>
              <p className="mt-4 text-base leading-relaxed">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
