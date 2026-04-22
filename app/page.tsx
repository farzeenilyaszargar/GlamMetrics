import Features from "@/components/features";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import Review from "@/components/review";
import Trust from "@/components/trust";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-[#F7DBE2]/70 via-white to-[#fff9fa] pt-24">
      <Navbar />
      <Hero />
      <Features />
      <Trust />
      <Review />
      <Footer />
    </main>
  );
}
