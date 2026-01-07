import type { Metadata } from "next";
import { Montserrat, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "README.wtf - AI-Powered README Generator",
  description: "Paste a GitHub URL. Get a README that doesn't suck. AI that actually reads your code.",
  keywords: ["README", "GitHub", "AI", "documentation", "developer tools"],
  openGraph: {
    title: "README.wtf - AI-Powered README Generator",
    description: "Paste a GitHub URL. Get a README that doesn't suck.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
