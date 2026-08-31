import type { Metadata } from "next";
import { DM_Serif_Display, Source_Sans_3 } from "next/font/google";
import SiteChrome from "@/components/SiteChrome";
import { org } from "@/data/mockData";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${org.shortName} | ${org.name}`,
    template: `%s | ${org.shortName}`,
  },
  description: org.tagline,
  metadataBase: new URL("https://arda.org.so"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sourceSans.variable} ${dmSerif.variable}`}>
      <body className="min-h-screen font-sans">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
