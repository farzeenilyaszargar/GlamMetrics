import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-[#F7DBE2]/70 via-white to-[#fff9fa] pt-24 flex flex-col justify-between">
      <Navbar />

      <section className="w-full flex-1 px-4 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-4xl rounded-3xl border border-[#ED2738]/20 bg-white p-7 shadow-sm sm:p-10">
          <h1 className="font-emilys-candy text-5xl leading-tight text-[#ED2738] sm:text-6xl">Privacy Policy</h1>

          <div className="mt-8 space-y-5 text-base leading-relaxed text-black/85">
            <p>We collect only the minimum data needed to provide face analysis features, improve performance, and keep your account secure.</p>
            <p>Your uploaded content is processed with strict access controls, and we do not sell personal data to third parties.</p>
            <p>You can request data removal or account deletion at any time by contacting support through the contact page.</p>
            <p>By using GlamMetrics, you agree to this privacy policy and any future updates posted on this page.</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
