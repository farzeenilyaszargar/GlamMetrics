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
    default: "Outfit Fix · ₹99 once | GlamMetrics",
    template: "%s | GlamMetrics",
  },
  description:
    "Get your outfit figured out for ₹99 once. A personal AI styling plan with specific changes, shoes, accessories and a getting-ready checklist. No subscription.",
  openGraph: {
    title: "Your outfit, figured out. ₹99 once.",
    description:
      "One photo. One complete Outfit Fix. ₹99 once, no subscription.",
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
