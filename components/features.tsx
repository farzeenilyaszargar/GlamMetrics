import Image from "next/image";

type Feature = {
  title: string;
  description: string;
  detail: string;
  image: string;
  reverse?: boolean;
};

const features: Feature[] = [
  {
    title: "Face Structure Mapping",
    description:
      "Understand facial balance and proportions through clear visual breakdowns that help you frame every shot better.",
    detail: "Precise geometry insights for cleaner composition decisions.",
    image: "/images/f1.png",
  },
  {
    title: "Expression Intelligence",
    description:
      "Identify which expressions look strongest on camera and repeat them consistently across reels, portraits, and campaigns.",
    detail: "Confidence-focused scoring built for camera-first creators.",
    image: "/images/f2.png",
    reverse: true,
  },
  {
    title: "Style-Ready Recommendations",
    description:
      "Get practical recommendations for beauty styling and pose direction based on your own face analysis patterns.",
    detail: "Actionable next steps, not generic beauty advice.",
    image: "/images/f3.png",
  },
];

function FeatureVisual({ image, title }: { image: string; title: string }) {
  return (
    <Image
      src={image}
      alt={title}
      width={1200}
      height={900}
      className="h-full min-h-[240px] w-full rounded-2xl border border-[#F7DBE2] object-cover shadow-sm sm:min-h-[300px]"
    />
  );
}

export default function Features() {
  return (
    <section id="features" className="w-full px-4 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="max-w-4xl font-emilys-candy text-5xl leading-tight text-[#ED2738] sm:text-6xl lg:text-7xl">
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
                <FeatureVisual image={feature.image} title={feature.title} />
              </div>

              <div className="flex lg:w-1/2 lg:items-center">
                <div>
                  <h3 className="font-emilys-candy text-4xl leading-tight text-[#ED2738] sm:text-5xl">{feature.title}</h3>
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
