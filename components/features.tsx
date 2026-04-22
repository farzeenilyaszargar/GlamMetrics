const primaryFeatures = [
  {
    title: "Face Structure Mapping",
    description:
      "Get detailed breakdowns of balance, framing, and contour patterns so every look starts from your natural strengths.",
  },
  {
    title: "Expression Performance",
    description:
      "Measure which expressions translate best on camera and learn how to repeat your strongest high-impact moments.",
  },
  {
    title: "Camera-Ready Guidance",
    description:
      "Turn analysis into practical tips for makeup direction, shot composition, and social-first visual storytelling.",
  },
  {
    title: "Consistency Tracking",
    description:
      "Compare sessions over time to see what changed and what keeps delivering a polished, repeatable signature style.",
  },
];

const secondaryFeatures = [
  "Fast upload and instant insights",
  "Built for creators and teams",
  "Designed for mobile shooting workflows",
  "Clear, actionable score summaries",
  "Private-by-default experience",
  "Simple interface with premium feel",
];

export default function Features() {
  return (
    <section className="w-full px-4 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">

        <h2 className="mt-4 max-w-4xl font-emilys-candy text-4xl leading-tight sm:text-6xl lg:text-6xl">
          Bigger Insights for Better Beauty Decisions
        </h2>

        <p className="mt-6 max-w-3xl text-lg leading-relaxed">
          GlamMetrics is built to go beyond surface-level feedback. From first upload to final content polish, every tool is designed to help you look more intentional, consistent, and camera-ready.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {primaryFeatures.map((item) => (
            <article key={item.title} className="rounded-3xl border p-7 shadow-sm sm:p-8">
              <h3 className="font-stack-sans-headline text-sm uppercase tracking-[0.12em]">{item.title}</h3>
              <p className="mt-4 text-base leading-relaxed sm:text-lg">{item.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border p-7 shadow-sm sm:p-8">
          <p className="font-stack-sans-headline text-sm uppercase tracking-[0.12em]">Also Included</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {secondaryFeatures.map((item) => (
              <p key={item} className="rounded-2xl border px-4 py-3 text-sm leading-relaxed sm:text-base">
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
