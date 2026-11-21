import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bon Goût du Grand Kloto", short_name: "Bon Goût", description: "Restaurant et produits locaux du Grand Kloto",
    start_url: "/", display: "standalone", background_color: "#fff8ee", theme_color: "#b91c1c", lang: "fr",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
