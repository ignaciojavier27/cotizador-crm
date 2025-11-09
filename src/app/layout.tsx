import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SonnerProvider } from "@/components/providers/SonnerProvider";
import { Providers } from "@/components/providers/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cotizador CRM",
  description: "Sistema de cotizaciones automatizado para PYMES",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50`}
      >
        <Providers>
          {children}
          <SonnerProvider />
        </Providers>
      </body>
    </html>
  );
}
