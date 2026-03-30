import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ma Ludothèque — Organisateur de jeux de société",
  description:
    "Organisez votre collection de jeux de société, suivez vos parties et découvrez de nouveaux jeux.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased min-h-screen">
        <nav className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
          <div className="container mx-auto px-4 max-w-5xl flex items-center gap-6 h-14">
            <Link
              href="/"
              className="font-bold text-amber-900 hover:text-amber-700 transition-colors"
            >
              🎲 Ma Ludothèque
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/"
                className="text-muted-foreground hover:text-amber-800 transition-colors"
              >
                Collection
              </Link>
              <Link
                href="/decouvrir"
                className="text-muted-foreground hover:text-teal-700 transition-colors"
              >
                Découvrir
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
