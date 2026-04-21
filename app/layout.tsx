import type { Metadata } from "next";
import { Emilys_Candy, Stack_Sans_Headline } from "next/font/google";
import "./globals.css";

export const emilysCandy = Emilys_Candy({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-emilys-candy",
});

export const stackSansHeadline = Stack_Sans_Headline({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-stack-sans-headline",
});

export const metadata: Metadata = {
  title: "GlamMetrics | A Glamorous Face Analysis Tool",
  description: "GlamMetrics is a cutting-edge face analysis tool that provides detailed insights into facial features, expressions, and emotions. With its advanced algorithms and user-friendly interface, GlamMetrics helps users understand and analyze facial data for various applications, including beauty, fashion, and social media.",
  keywords: [
    "face analysis",
    "facial features",
    "emotion recognition",
    "beauty analysis",
    "fashion insights",
    "social media analytics",
    "GlamMetrics",
    "face recognition",
    "facial expression analysis",
    "AI face analysis",
    "face detection",
    "facial landmark detection",
    "face attribute analysis",
    "face recognition technology",
    "face analysis tool",
  ],
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en" className={`${emilysCandy.variable} ${stackSansHeadline.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
