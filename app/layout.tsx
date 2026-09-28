import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { SessionProvider } from "@/components/session";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import "./globals.css";
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
export const metadata: Metadata = {
  icons: { icon: "/brand-icon.svg", apple: "/brand-icon.svg" },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "GlamMetrics — Your style. Turned up.",
    template: "%s | GlamMetrics",
  },
  description:
    "Your personal AI style studio. Outfit reviews, thoughtful colour palettes and occasion-ready ideas for Indian wardrobes. Your first review is on us.",
  openGraph: {
    title: "Your style. Turned up.",
    description:
      "Meet your personal AI style studio. Try your first outfit review free.",
    images: [{ url: "/images/editorial.png", width: 1086, height: 1448 }],
  },
  twitter: { card: "summary_large_image" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111111",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={sans.variable} data-scroll-behavior="smooth">
      <body>
        <SessionProvider>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <Navbar />
          {children}
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
