import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Forge Die",
  title: "CSK 3/4 lockbolt — 300 t forging die",
  description:
    "Closed-die heading setup for a Bolton 3/4 inch countersunk lockbolt, 150 mm pin, on a 300 tonne hydraulic press.",
  appleWebApp: {
    capable: true,
    title: "Forge Die",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#14110e",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
