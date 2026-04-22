import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 w-full px-4 pt-4 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-[#ED2738]/20 bg-white/75 px-5 py-3 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/60 sm:px-6">
        <Link href="/" className="font-emilys-candy text-2xl leading-none text-[#ED2738]">
          GlamMetrics
        </Link>

        <Link
          href="/auth"
          className="rounded-full border border-[#ED2738] bg-[#ED2738] px-5 py-2 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 hover:border-black hover:bg-black hover:text-[#F7DBE2]"
        >
          Start Free
        </Link>
      </div>
    </nav>
  );
}
