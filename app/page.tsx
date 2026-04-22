import Features from "@/components/features";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import LowerHero from "@/components/lower-hero";
import Navbar from "@/components/navbar";
import Review from "@/components/review";
import Trust from "@/components/trust";

export default function Home() {
  return (
    <main id="top" className="flex min-h-screen w-full flex-col gap-6 bg-[#FBD4D7] pt-24 sm:gap-8">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Trust />
      <Review />
      <LowerHero />
      <Footer />
    </main>
  );
}
