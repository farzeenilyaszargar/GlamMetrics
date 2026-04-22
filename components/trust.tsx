const trustItems = [
  { value: "13.2K+", label: "analyses completed" },
  { value: "3K+", label: "active monthly users" },
  { value: "4.8/5", label: "creator rating" },
];

export default function Trust() {
  return (
    <section className="w-full px-4 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-center font-stack-sans-headline text-sm text-black/75">
          Trusted by people worldwide
        </p>

        <div className="mt-4 grid divide-y divide-[#ED2738]/20 md:grid-cols-3 md:divide-x md:divide-y-0">
          {trustItems.map((item) => (
            <article key={item.label} className="px-5 py-4 text-center">
              <p className="font-emilys-candy text-4xl leading-none text-[#ED2738]">{item.value}</p>
              <p className="mt-2 font-stack-sans-headline text-[11px] uppercase tracking-[0.12em] text-black/80">{item.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
