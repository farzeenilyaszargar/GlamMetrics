import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-[#F7DBE2]/70 via-white to-[#fff9fa] px-4 py-16">
      <section className="w-full max-w-2xl rounded-3xl border border-[#ED2738]/20 bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="font-stack-sans-headline text-xs uppercase tracking-[0.2em] text-[#ED2738]">Error 404</p>
        <h1 className="mt-4 font-emilys-candy text-6xl leading-tight text-[#ED2738] sm:text-7xl">Page Not Found</h1>
        <p className="mt-5 text-base leading-relaxed text-black/80 sm:text-lg">
          The page you are looking for does not exist or may have been moved.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-[#ED2738] bg-[#ED2738] px-6 py-3 font-stack-sans-headline text-xs uppercase tracking-[0.12em] text-white transition-transform hover:-translate-y-0.5 hover:border-black hover:bg-black hover:text-[#F7DBE2]"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
