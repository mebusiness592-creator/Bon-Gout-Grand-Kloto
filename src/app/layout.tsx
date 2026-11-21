import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
export const metadata: Metadata = {
  title: "Bon Goût du Grand Kloto | Restaurant & Huile rouge",
  description: "Commandez les spécialités du Restaurant Bon Goût du Grand Kloto et découvrez notre huile rouge.",
  manifest: "/manifest.webmanifest",
  themeColor: "#123b2c"
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body><CartProvider>{children}</CartProvider></body></html>;
}
