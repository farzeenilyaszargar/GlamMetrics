import Features from "@/components/features";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import Review from "@/components/review";
import Trust from "@/components/trust";

export default function Home() {
  return (
    <main className="min-h-screen w-full">
      <Navbar />
      <Hero />
      <Trust />
      <Features />
      <Review />
      <Footer />
    </main>
  );
}
