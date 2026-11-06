import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mufrodat Kids | Belajar Bahasa Arab Jadi Seru",
    template: "%s | Mufrodat Kids",
  },
  description: "Media belajar kosakata Bahasa Arab untuk siswa SD/MI melalui gambar, audio, dan permainan interaktif.",
  applicationName: "Mufrodat Kids",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
