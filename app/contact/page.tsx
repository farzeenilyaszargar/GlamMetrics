import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function ContactPage() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-[#F7DBE2]/70 via-white to-[#fff9fa] pt-24">
      <Navbar />

      <section className="w-full px-4 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-4xl rounded-3xl border border-[#ED2738]/20 bg-white p-7 shadow-sm sm:p-10">
          <p className="font-stack-sans-headline text-xs uppercase tracking-[0.2em] text-[#ED2738]">Contact</p>
          <h1 className="mt-4 font-emilys-candy text-5xl leading-tight text-[#ED2738] sm:text-6xl">Get in Touch</h1>

          <div className="mt-8 space-y-4 text-base leading-relaxed text-black/85">
            <p>Questions, support requests, or partnership inquiries are always welcome.</p>
            <p>
              Email: <a href="mailto:hello@glammetrics.com" className="font-medium text-[#ED2738] underline underline-offset-4 hover:text-black">hello@glammetrics.com</a>
            </p>
            <p>
              Press: <a href="mailto:press@glammetrics.com" className="font-medium text-[#ED2738] underline underline-offset-4 hover:text-black">press@glammetrics.com</a>
            </p>
            <p>Response time: usually within 24-48 hours on business days.</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
