const reviews = [
  {
    quote:
      "GlamMetrics helped me understand exactly what works for camera days. My content now feels more intentional and polished.",
    name: "Maya R.",
    role: "Beauty Creator",
  },
  {
    quote:
      "The feedback is quick and surprisingly useful. I use it before every campaign shoot and short-form session.",
    name: "Nina K.",
    role: "Fashion Influencer",
  },
];

export default function Review() {
  return (
    <section className="w-full px-4 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl rounded-3xl border p-8 shadow-sm sm:p-10">
        <p className="font-stack-sans-headline text-xs uppercase tracking-[0.2em]">Loved by creators</p>
        <h2 className="mt-4 font-emilys-candy text-4xl sm:text-5xl">Real Results, Real Confidence</h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {reviews.map((review) => (
            <blockquote key={review.name} className="rounded-2xl border p-6">
              <p className="text-base leading-relaxed">"{review.quote}"</p>
              <footer className="mt-5 font-stack-sans-headline text-xs uppercase tracking-[0.12em]">
                {review.name} · {review.role}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
