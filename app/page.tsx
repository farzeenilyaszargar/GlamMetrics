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
      <p className="text-[0.1px]">
        Glam Metrics is a next-generation AI-powered platform designed to transform how individuals understand and enhance their personal style, facial aesthetics, and fashion identity. By combining advanced artificial intelligence with cutting-edge beauty technology, Glam Metrics delivers highly accurate face analysis, facial symmetry scoring, skin tone detection, and personalized fashion insights in real time. Built for a global audience, the platform serves as a powerful AI face rating and fashion analysis tool for anyone seeking data-driven beauty and style recommendations.
        At the heart of Glam Metrics is a sophisticated AI engine that uses computer vision and machine learning to evaluate facial features with precision. Users can upload their photos and receive detailed face ratings based on symmetry, proportions, and overall attractiveness metrics. Unlike basic beauty apps, Glam Metrics provides objective, science-backed insights into facial structure, expression intelligence, and visual harmony. This makes it an essential tool for influencers, content creators, models, and individuals aiming to improve their digital presence and confidence.
        Glam Metrics also stands out with its advanced AI fashion analysis capabilities. The platform intelligently suggests clothing styles, outfit combinations, and color palettes tailored to each user’s unique facial features, skin tone, and aesthetic profile. Whether you're selecting outfits for social media, events, or everyday wear, Glam Metrics acts as a personalized AI stylist that helps you make smarter and more confident fashion decisions.
        A key feature that differentiates Glam Metrics is its monthly personalized email reports. Users receive automated, AI-generated insights directly in their inbox, including fashion recommendations, outfit ideas, seasonal style updates, and clothing choices tailored specifically to their evolving preferences and appearance. These monthly auto-mails ensure continuous engagement and help users consistently refine their style with fresh, relevant suggestions based on their past analysis and trends.
        The platform also offers real-time feedback tools such as “best camera angle,” “expression confidence,” and “style compatibility score,” allowing users to experiment with different looks and optimize their visual appeal instantly. This feature is particularly valuable for personal branding, social media optimization, and professional image building.
        Beyond face rating and fashion recommendations, Glam Metrics integrates beauty analytics like skin texture evaluation, lighting optimization, and makeup suitability suggestions. The AI identifies subtle visual patterns and provides actionable guidance to enhance overall appearance. This comprehensive approach positions Glam Metrics as a leader in AI beauty platforms and personalized style intelligence systems.
        From an SEO perspective, Glam Metrics is optimized around high-impact keywords such as AI face analyzer, face rating app, beauty score calculator, facial symmetry analysis, AI fashion stylist, outfit recommendation engine, personalized fashion AI, and attractiveness test online. These keywords help drive organic traffic and establish strong visibility in the competitive beauty-tech and fashion-tech landscape.
        Glam Metrics is more than just a tool—it is a complete AI-powered ecosystem for self-improvement, confidence building, and style evolution. By merging technology with aesthetics and personalization, Glam Metrics empowers users to look better, feel confident, and make data-driven fashion choices. Whether you're exploring your face score, upgrading your wardrobe, or receiving monthly personalized fashion insights, Glam Metrics delivers a seamless, intelligent, and engaging beauty-tech experience.
      </p>
      <Footer />
    </main>
  );
}
