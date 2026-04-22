const trustItems = [
  { value: "1.8M+", label: "analyses completed" },
  { value: "240K+", label: "active monthly users" },
  { value: "4.9/5", label: "creator rating" },
];

export default function Trust() {
  return (
    <section className="w-full px-4 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {trustItems.map((item) => (
            <article key={item.label} className="rounded-2xl border border-[#ED2738]/20 bg-[#F7DBE2]/50 px-5 py-4 text-center shadow-sm transition-colors duration-300 hover:border-[#ED2738]/45 hover:bg-[#F7DBE2]/80">
              <p className="font-emilys-candy text-4xl leading-none text-[#ED2738]">{item.value}</p>
              <p className="mt-2 font-stack-sans-headline text-[11px] uppercase tracking-[0.12em] text-black/80">{item.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
