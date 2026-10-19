import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MAKEN VISA",
    short_name: "MAKEN VISA",
    description: "Track your visa application, documents and payments",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1c1917",
    theme_color: "#d97706",
    categories: ["business"],
    icons: [
      { src: "/icon-72x72.png",   sizes: "72x72",   type: "image/png" },
      { src: "/icon-96x96.png",   sizes: "96x96",   type: "image/png" },
      { src: "/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { src: "/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { src: "/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { src: "/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { src: "/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
