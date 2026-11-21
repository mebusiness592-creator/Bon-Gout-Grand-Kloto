import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";

export const metadata: Metadata = {
  title: { default: "Bon Goût du Grand Kloto — Restaurant & produits locaux", template: "%s | Bon Goût du Grand Kloto" },
  description: "Restaurant Bon Goût : cuisine africaine, européenne, fast-food et grillades. Huile rouge de palme et produits locaux du Grand Kloto.",
  applicationName: "Bon Goût", appleWebApp: { capable: true, title: "Bon Goût", statusBarStyle: "default" },
};
export const viewport: Viewport = { themeColor: "#b91c1c", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body><CartProvider>{children}</CartProvider></body>
    </html>
  );
}
