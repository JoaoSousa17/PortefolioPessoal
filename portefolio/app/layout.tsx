import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider } from "../lib/context/LanguageContext";
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"; // 1. Importa o componente de Script
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
  title: "João Sousa - Portefólio",
  description: "Portefólio de João Sousa desenvolvido com Next.js",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt"> 
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* 2. Configuração do Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0984VRHX4X"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0984VRHX4X');
          `}
        </Script>

        <LanguageProvider>
          {children}
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  );
}
