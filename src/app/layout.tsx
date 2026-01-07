import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "README.wtf - AI-Powered README Generator",
  description: "Paste a GitHub URL. Get a README that doesn't suck. AI that actually reads your code.",
  keywords: ["README", "GitHub", "AI", "documentation", "developer tools", "README generator"],
  authors: [{ name: "README.wtf" }],
  openGraph: {
    title: "README.wtf - AI-Powered README Generator",
    description: "Paste a GitHub URL. Get a README that doesn't suck.",
    type: "website",
    url: "https://readme.wtf",
  },
  twitter: {
    card: "summary_large_image",
    title: "README.wtf - AI-Powered README Generator",
    description: "Paste a GitHub URL. Get a README that doesn't suck.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
