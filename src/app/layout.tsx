import type { Metadata } from "next";
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
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
