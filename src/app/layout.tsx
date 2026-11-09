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
  title: "DSCPL WEAR - Custom Apparel",
  description: "Pusat Sablon DTF dan Kebutuhan Custom Printing",
  icons: {
    icon: [
      { url: "/logo-dscpl.png", type: "image/png" }
    ],
    shortcut: "/logo-dscpl.png",
    apple: "/logo-dscpl.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" type="image/png" href="/logo-dscpl.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        {/* Navbar dipasang secara global tanpa bar hitam atas */}
        <Navbar />
        
        {/* Konten utama dari setiap halaman */}
        {children}
      </body>
    </html>
  );
}