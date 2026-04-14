import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "YEHS Contractor & Visitor Log",
    short_name: "YEHS Log",
    description: "Multi-hotel contractor, visitor, and temporary access log.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f2350",
    theme_color: "#0f2350",
    icons: [
      {
        src: "/shortcut-icon.png",
        sizes: "2016x2016",
        type: "image/png",
      },
      {
        src: "/shortcut-icon.png",
        sizes: "2016x2016",
        type: "image/png",
      },
    ],
  };
}
