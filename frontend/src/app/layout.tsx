import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Serif_SC, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const notoSerif = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-cjk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://ink-name.vercel.app",
  ),
  title: {
    default: "Ink Name · Your name, rewritten in ink",
    template: "%s · Ink Name",
  },
  description:
    "A name five thousand years in the making, waiting for you. Chosen by sound, by season, and by the five elements — free to discover, beautiful to keep.",
  keywords: [
    "Chinese name generator",
    "Chinese name for foreigners",
    "Chinese calligraphy name",
    "八字 name",
    "五行 naming",
    "Mandarin name",
  ],
  openGraph: {
    title: "Ink Name · Your name, rewritten in ink",
    description:
      "A name five thousand years in the making, waiting for you. Chosen by sound, by season, and by the five elements.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ink Name · 落墨即名",
    description:
      "A name five thousand years in the making, waiting for you.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${cormorant.variable} ${notoSerif.variable}`}
    >
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
