import type { Metadata, Viewport } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import { SessionProvider } from "@/components/session";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import "./globals.css";
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
});
export const metadata: Metadata = {
  icons: { icon: "/brand-icon.svg", apple: "/brand-icon.svg" },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "GlamMetrics — Your wardrobe. More possibilities.",
    template: "%s | GlamMetrics",
  },
  description:
    "Turn one outfit photo into three ways to wear it. Personal AI styling plans for Indian wardrobes, with wardrobe-first advice and practical checklists. First plan free. ₹99/month for 10 plans.",
  openGraph: {
    title: "You have the clothes. Let’s make the look.",
    description:
      "Three styled looks, a no-shopping version and a getting-ready checklist. Try your first plan free.",
    images: [{ url: "/images/editorial.png", width: 1086, height: 1448 }],
  },
  twitter: { card: "summary_large_image" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbf9f6",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable}`}
      data-scroll-behavior="smooth"
    >
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
