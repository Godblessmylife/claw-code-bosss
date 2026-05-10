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

const APP_URL = "https://claw-code-bosss.vercel.app";

export const metadata: Metadata = {
  title: "JP Code v1.6.1 — AI Coding Assistant",
  description:
    "JP Code — advanced AI coding agent powered by Claude Opus. Write, debug, review and ship production-quality code faster. Free, private, no login required.",
  metadataBase: new URL(APP_URL),
  icons: {
    icon: "/icon.jpg",
    apple: "/icon.jpg",
  },
  openGraph: {
    title: "JP Code — AI Coding Assistant",
    description:
      "Write, debug and ship code with Claude Opus AI. Generate full projects, preview live, download ZIP, deploy to Vercel.",
    url: APP_URL,
    siteName: "JP Code",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "JP Code — AI Coding Assistant",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JP Code — AI Coding Assistant",
    description:
      "Generate production-quality code with Claude Opus AI. Free, private, no login.",
    images: ["/og.jpg"],
  },
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
