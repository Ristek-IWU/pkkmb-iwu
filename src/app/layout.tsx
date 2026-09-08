import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PKKMB IWU 2026 — International Women University",
  description:
    "Portal resmi PKKMB International Women University. Buat Twibbon, lihat agenda, dan panduan PKKMB.",
  icons: {
    icon: "/images/logo-iwu-fav-footer.jpeg",
  },
  openGraph: {
    title: "PKKMB IWU 2026 — International Women University",
    description:
      "Portal resmi PKKMB International Women University. Buat Twibbon, lihat agenda, dan panduan PKKMB.",
    images: ["/images/logo-iwu-fav-footer.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
