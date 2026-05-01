import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Inter,
  Liu_Jian_Mao_Cao,
  Long_Cang,
  Ma_Shan_Zheng,
  Noto_Serif_SC,
  ZCOOL_XiaoWei,
  Zhi_Mang_Xing,
} from "next/font/google";
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

// Calligraphy styles — free brush fonts from Google Fonts.
// We expose them via CSS variables so a Tailwind utility (font-[var(--…)])
// can swap a single character into a different visual style instantly.
const maShanZheng = Ma_Shan_Zheng({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-cal-brush",
  display: "swap",
});
const zhiMangXing = Zhi_Mang_Xing({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-cal-running",
  display: "swap",
});
const liuJianMaoCao = Liu_Jian_Mao_Cao({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-cal-semicursive",
  display: "swap",
});
const longCang = Long_Cang({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-cal-cursive",
  display: "swap",
});
const zcoolXiaoWei = ZCOOL_XiaoWei({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-cal-clerical",
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
      className={[
        "dark",
        inter.variable,
        cormorant.variable,
        notoSerif.variable,
        maShanZheng.variable,
        zhiMangXing.variable,
        liuJianMaoCao.variable,
        longCang.variable,
        zcoolXiaoWei.variable,
      ].join(" ")}
    >
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
