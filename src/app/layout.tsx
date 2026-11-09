import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // Impor komponen Navbar

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DSCPL WEAR - Precision Workshop",
  description: "Pusat Sablon DTF dan Kebutuhan Custom Printing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        {/* Navbar dipasang secara global tanpa bar hitam atas */}
        <Navbar />
        
        {/* Konten utama dari setiap halaman */}
        {children}
      </body>
    </html>
  );
}