type Feature = {
  title: string;
  description: string;
  detail: string;
  reverse?: boolean;
};

const features: Feature[] = [
  {
    title: "Face Structure Mapping",
    description:
      "Understand facial balance and proportions through clear visual breakdowns that help you frame every shot better.",
    detail: "Precise geometry insights for cleaner composition decisions.",
  },
  {
    title: "Expression Intelligence",
    description:
      "Identify which expressions look strongest on camera and repeat them consistently across reels, portraits, and campaigns.",
    detail: "Confidence-focused scoring built for camera-first creators.",
    reverse: true,
  },
  {
    title: "Style-Ready Recommendations",
    description:
      "Get practical recommendations for beauty styling and pose direction based on your own face analysis patterns.",
    detail: "Actionable next steps, not generic beauty advice.",
  },
];

function FeatureVisual() {
  return (
    <div className="flex h-full min-h-[240px] items-center justify-center rounded-3xl border border-[#ED2738]/20 bg-[#F7DBE2]/55 p-8 shadow-sm transition-colors duration-300 sm:min-h-[300px]">
      <div className="relative flex h-full w-full items-center justify-center rounded-2xl border border-[#ED2738]/25 bg-white/80 transition-colors duration-300">
        <div className="absolute left-6 top-6 h-12 w-12 rounded-full border border-[#ED2738]/30" />
        <div className="absolute bottom-6 right-6 h-16 w-16 rounded-2xl border border-[#ED2738]/35" />
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-12 w-12 text-[#ED2738]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="7" />
          <path d="M12 7v5l3 2" />
        </svg>
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <section className="w-full px-4 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <p className="font-stack-sans-headline text-xs uppercase tracking-[0.2em] text-[#ED2738]">Features</p>
        <h2 className="mt-4 max-w-4xl font-emilys-candy text-5xl leading-tight text-[#ED2738] sm:text-6xl lg:text-7xl">
          Clean, Powerful Features for Everyday Creators
        </h2>

        <div className="mt-12 space-y-8">
          {features.map((feature) => (
            <article
              key={feature.title}
              className={`flex flex-col gap-6 rounded-3xl border border-[#ED2738]/20 bg-white p-6 shadow-sm transition-colors duration-300 hover:border-[#ED2738]/45 hover:bg-[#fff8fa] sm:p-8 lg:items-stretch lg:gap-10 ${
                feature.reverse ? "lg:flex-row-reverse" : "lg:flex-row"
              }`}
            >
              <div className="lg:w-1/2">
                <FeatureVisual />
              </div>

              <div className="flex lg:w-1/2 lg:items-center">
                <div>
                  <h3 className="font-stack-sans-headline text-sm uppercase tracking-[0.14em] text-[#ED2738]">{feature.title}</h3>
                  <p className="mt-4 text-lg leading-relaxed text-black/85 sm:text-xl">{feature.description}</p>
                  <p className="mt-4 font-stack-sans-headline text-xs uppercase tracking-[0.12em] text-[#ED2738]/80">{feature.detail}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
