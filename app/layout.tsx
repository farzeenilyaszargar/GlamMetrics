import type { Metadata, Viewport } from "next";
import { DM_Sans, Cormorant_Garamond } from "next/font/google";
import { SessionProvider } from "@/components/session";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import "./globals.css";
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});
export const metadata: Metadata = {
  icons: { icon: "/brand-icon.svg", apple: "/brand-icon.svg" },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "GlamMetrics — Your style, beautifully considered",
    template: "%s | GlamMetrics",
  },
  description:
    "Your personal AI style studio. Outfit reviews, thoughtful colour palettes and occasion-ready ideas for Indian wardrobes. Your first review is on us.",
  openGraph: {
    title: "Your style, beautifully considered",
    description:
      "Meet your personal AI style studio. Try your first outfit review free.",
    images: [{ url: "/images/editorial.png", width: 1086, height: 1448 }],
  },
  twitter: { card: "summary_large_image" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAF7F2",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
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
