import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CSK 3/4\" lockbolt — 300 t forging die",
    short_name: "Forge Die",
    description:
      "Closed-die heading simulation for a Bolton 3/4 inch countersunk lockbolt on a 300 tonne hydraulic press.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#14110e",
    theme_color: "#14110e",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
