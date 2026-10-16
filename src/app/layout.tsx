import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";

import { ThemeScript } from "@/components/theme";
import { ToastProvider } from "@/components/ui/toast";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  title: {
    default: "Canopy — grow your internship search",
    template: "%s · Canopy",
  },
  description:
    "A cozy, gamified internship tracker. Every application plants something in your forest. Track applications, resume versions, keyword matches, and interview prep in one place.",
  applicationName: "Canopy",
  appleWebApp: { capable: true, title: "Canopy", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f4ea" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1a14" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full bg-paper text-ink">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
