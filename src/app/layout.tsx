import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/shared/layout/Header";
import { Footer } from "@/components/shared/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Abidjan Hustle — Le Rêve Ivoirien",
    template: "%s | Abidjan Hustle",
  },
  description:
    "RPG de vie à Abidjan (Yopougon) : djossi, tontine, nouchi et enjaillement. Vertical slice web jouable dans le navigateur.",
  keywords: [
    "Abidjan Hustle",
    "jeu",
    "RPG",
    "Abidjan",
    "Yopougon",
    "nouchi",
    "vertical slice",
    "Next.js",
  ],
  authors: [{ name: "Abidjan Hustle" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Abidjan Hustle — Le Rêve Ivoirien",
    description:
      "RPG de vie à Yopougon : djossi, tontine, nouchi et enjaillement, jouable dans le navigateur.",
    url: "/",
    siteName: "Abidjan Hustle",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Abidjan Hustle — Le Rêve Ivoirien",
    description:
      "RPG de vie à Yopougon : djossi, tontine, nouchi et enjaillement, jouable dans le navigateur.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/*
          Wrapper racine : colonne flex pleine hauteur.
          - `main` en flex-1 occupe l'espace disponible.
          - `Footer` porte `mt-auto` → sticky en bas quand le contenu est court,
            poussé naturellement quand le contenu déborde (jamais d'overlay).
        */}
        <div className="flex min-h-screen flex-col">
          <a
            href="#contenu-principal"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-md focus:border focus:bg-background focus:px-4 focus:text-sm focus:font-medium"
          >
            Aller au contenu principal
          </a>
          <Header />
          <main id="contenu-principal" tabIndex={-1} className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
