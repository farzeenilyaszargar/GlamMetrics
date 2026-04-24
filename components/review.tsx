type Review = {
  name: string;
  handle: string;
  role: string;
  quote: string;
  stars: number;
  likes: string;
  views: string;
  size: string;
};

const colOne: Review[] = [
  {
    name: "Maya Rao",
    handle: "@mayaframe",
    role: "Beauty Creator",
    quote:
      "Used GlamMetrics before filming and my hit-rate on first takes got way better. It catches details I usually miss.",
    stars: 5,
    likes: "1.2K",
    views: "38K",
    size: "min-h-[220px]",
  },
  {
    name: "Sana Malik",
    handle: "@sanamotion",
    role: "UGC Strategist",
    quote:
      "Quick upload, clean feedback, no confusion. Team now uses it in every pre-post checklist.",
    stars: 4,
    likes: "546",
    views: "17K",
    size: "min-h-[180px]",
  },
  {
    name: "Leena Joseph",
    handle: "@leenadaily",
    role: "Lifestyle Creator",
    quote: "Looks premium, feels fast, and the suggestions are straightforward enough to apply instantly.",
    stars: 5,
    likes: "689",
    views: "21K",
    size: "min-h-[200px]",
  },
  {
    name: "Alya Noor",
    handle: "@alyalooks",
    role: "Makeup Artist",
    quote: "I rely on it before client reels. The face feedback makes every look more balanced in-camera.",
    stars: 5,
    likes: "773",
    views: "22K",
    size: "min-h-[190px]",
  },
  {
    name: "Priya Das",
    handle: "@priyacreates",
    role: "Lifestyle Creator",
    quote: "Simple flow, high-quality guidance, and consistent results across portrait and selfie frames.",
    stars: 5,
    likes: "635",
    views: "18K",
    size: "min-h-[205px]",
  },
];

const colTwo: Review[] = [
  {
    name: "Nina Kapoor",
    handle: "@ninastyled",
    role: "Fashion Influencer",
    quote:
      "The expression score is honestly so useful for campaign shoots. It feels like having a creative assistant in pocket.",
    stars: 5,
    likes: "824",
    views: "24K",
    size: "min-h-[230px]",
  },
  {
    name: "Ari Patel",
    handle: "@arioncam",
    role: "Content Producer",
    quote:
      "We improved thumbnail consistency across channels after a week of using it. Really practical insights.",
    stars: 5,
    likes: "972",
    views: "29K",
    size: "min-h-[190px]",
  },
  {
    name: "Kara Dev",
    handle: "@karacuts",
    role: "Short-Form Editor",
    quote: "I now test look + expression before posting. Engagement curve has been way more stable.",
    stars: 5,
    likes: "602",
    views: "19K",
    size: "min-h-[210px]",
  },
  {
    name: "Mira Jain",
    handle: "@mirastudio",
    role: "Portrait Creator",
    quote: "This helped me lock in my best profile angles. My client previews now need far fewer retakes.",
    stars: 4,
    likes: "511",
    views: "16K",
    size: "min-h-[200px]",
  },
  {
    name: "Zoya Khan",
    handle: "@zoyaframe",
    role: "Beauty Entrepreneur",
    quote: "Great blend of speed and precision. It feels premium and still stays practical for everyday use.",
    stars: 5,
    likes: "708",
    views: "20K",
    size: "min-h-[220px]",
  },
];

const colThree: Review[] = [
  {
    name: "Rhea Singh",
    handle: "@rheamode",
    role: "Style Creator",
    quote: "Finally a tool that gives beauty feedback in language I can actually use right away.",
    stars: 5,
    likes: "731",
    views: "23K",
    size: "min-h-[185px]",
  },
  {
    name: "Tara Neil",
    handle: "@tarainfocus",
    role: "Campaign Lead",
    quote:
      "Our team cycles through concepts faster because GlamMetrics makes approvals easier with objective signals.",
    stars: 4,
    likes: "483",
    views: "14K",
    size: "min-h-[235px]",
  },
  {
    name: "Isha Menon",
    handle: "@ishaframe",
    role: "Creator Coach",
    quote: "My clients feel more confident after each scan. It removes guesswork from beauty choices.",
    stars: 5,
    likes: "811",
    views: "26K",
    size: "min-h-[200px]",
  },
  {
    name: "Ritu Sen",
    handle: "@ritureels",
    role: "Social Strategist",
    quote: "The insights are clear enough to act on instantly, even when publishing on tight schedules.",
    stars: 5,
    likes: "664",
    views: "18K",
    size: "min-h-[195px]",
  },
  {
    name: "Noor Ali",
    handle: "@noorstudio",
    role: "Brand Creator",
    quote: "Our campaign visuals became much more consistent after adding GlamMetrics to our creative workflow.",
    stars: 5,
    likes: "892",
    views: "27K",
    size: "min-h-[215px]",
  },
];

function StarRow({ stars }: { stars: number }) {
  return (
    <p className="font-stack-sans-headline text-sm tracking-[0.08em] text-[#ED2738]" aria-label={`${stars} out of 5 stars`}>
      {"★".repeat(stars)}{"☆".repeat(5 - stars)}
    </p>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <p className="font-stack-sans-headline text-[11px] uppercase tracking-[0.12em]">
      {value} {label}
    </p>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className={`rounded-3xl border border-[#ED2738]/20 bg-white p-5 shadow-sm transition-colors duration-300 hover:border-[#ED2738]/45 hover:bg-[#fff8fa] max-sm:min-h-0 max-sm:p-4 sm:p-6 ${review.size}`}>
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ED2738]/30 bg-[#F7DBE2] font-stack-sans-headline text-xs uppercase tracking-[0.08em] text-[#ED2738]">
            {review.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <p className="font-stack-sans-headline text-xs uppercase tracking-[0.1em] text-black">{review.name}</p>
            <p className="text-sm opacity-75">{review.handle}</p>
          </div>
        </div>
        <p className="font-stack-sans-headline text-xs uppercase tracking-[0.12em] text-[#ED2738]">X</p>
      </header>

      <p className="mt-4 text-base leading-relaxed">{review.quote}</p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <StarRow stars={review.stars} />
        <p className="font-stack-sans-headline text-[11px] uppercase tracking-[0.12em] text-[#ED2738]/80">{review.role}</p>
      </div>

      <footer className="mt-5 flex flex-wrap items-center gap-4">
        <Stat label="likes" value={review.likes} />
        <Stat label="views" value={review.views} />
      </footer>
    </article>
  );
}

function MarqueeColumn({ reviews, direction }: { reviews: Review[]; direction: "up" | "down" }) {
  return (
    <div className="review-marquee-shell hidden h-[760px] overflow-hidden rounded-3xl lg:block">
      <div className={`review-marquee-track ${direction === "down" ? "review-marquee-down" : "review-marquee-up"}`}>
        {[...reviews, ...reviews].map((review, index) => (
          <ReviewCard key={`${review.handle}-${index}`} review={review} />
        ))}
      </div>
    </div>
  );
}

export default function Review() {
  const stackedMobile = [...colOne, ...colTwo, ...colThree];

  return (
    <section id="reviews" className="w-full px-4 py-16 max-sm:py-12 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">

        <h2 className="mt-4 max-w-3xl font-emilys-candy text-5xl leading-tight text-[#ED2738] max-sm:text-4xl sm:text-6xl">What Creators Are Saying</h2>

        <div className="mt-10 grid gap-6 max-sm:mt-7 max-sm:gap-4 sm:grid-cols-2 lg:hidden">
          {stackedMobile.map((review) => (
            <ReviewCard key={`mobile-${review.handle}`} review={review} />
          ))}
        </div>

        <div className="mt-10 hidden gap-6 lg:grid lg:grid-cols-3">
          <MarqueeColumn reviews={colOne} direction="down" />
          <MarqueeColumn reviews={colTwo} direction="up" />
          <MarqueeColumn reviews={colThree} direction="down" />
        </div>
      </div>
    </section>
  );
}
