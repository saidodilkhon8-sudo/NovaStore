import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Nova Store - Discover Amazing Software",
    template: "%s | Nova Store",
  },
  description: "Discover, download, and manage your favorite applications. A modern software marketplace.",
  keywords: ["software", "apps", "download", "marketplace", "windows", "applications"],
  authors: [{ name: "Nova Store" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://novastore.dev",
    siteName: "Nova Store",
    title: "Nova Store - Discover Amazing Software",
    description: "Discover, download, and manage your favorite applications.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nova Store",
    description: "Discover, download, and manage your favorite applications.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <LanguageProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
