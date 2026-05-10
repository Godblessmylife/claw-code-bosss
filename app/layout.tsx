import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppWithIntro } from "@/components/AppWithIntro";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JP Code v1.6.1 — AI Coding Assistant",
  description:
    "JP Code — advanced AI coding agent powered by Claude. Write, debug, review and ship code faster.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="matrix"
      className={`${geistSans.variable} ${geistMono.variable} bg-background h-full antialiased`}
    >
      {/* Inline script runs synchronously before paint — prevents theme flash on navigation */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('jp_code_theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="h-full flex flex-col font-mono">
        <AppWithIntro>{children}</AppWithIntro>
      </body>
    </html>
  );
}
