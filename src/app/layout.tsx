import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://getqurantutor.com"),
  title: {
    default: "GetQuranTutor — Verified Quran teachers for your family",
    template: "%s | GetQuranTutor",
  },
  description:
    "Tell us what you need — Islamic studies, Arabic and more — and receive quotes from verified male and female teachers. Free for families.",
  openGraph: {
    title: "GetQuranTutor — Verified Quran teachers for your family",
    description:
      "Islamic studies, Arabic and more with reviewed male and female teachers. Compare quotes and start this week.",
    url: "https://getqurantutor.com",
    siteName: "GetQuranTutor",
    type: "website",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
