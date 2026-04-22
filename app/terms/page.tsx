import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function TermsPage() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-[#F7DBE2]/70 via-white to-[#fff9fa] pt-24 flex flex-col justify-between">
      <Navbar />

      <section className="w-full flex-1 px-4 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-4xl rounded-3xl border border-[#ED2738]/20 bg-white p-7 shadow-sm sm:p-10">
          <h1 className="font-emilys-candy text-5xl leading-tight text-[#ED2738] sm:text-6xl">Terms of Service</h1>

          <div className="mt-8 space-y-5 text-base leading-relaxed text-black/85">
            <p>GlamMetrics is provided for personal and professional creative guidance. You agree to use the service lawfully and responsibly.</p>
            <p>You are responsible for the content you upload and for ensuring you have rights to use submitted media.</p>
            <p>We may update features, pricing, and policies over time. Continued use of the platform means you accept the latest terms.</p>
            <p>Violation of these terms may result in account suspension or restricted access to protect users and platform integrity.</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
