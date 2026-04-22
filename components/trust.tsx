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
            <article key={item.label} className="rounded-2xl text-center  px-5 py-4">
              <p className="font-emilys-candy text-4xl leading-none">{item.value}</p>
              <p className="mt-2 font-stack-sans-headline text-[11px] uppercase tracking-[0.12em]">{item.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
