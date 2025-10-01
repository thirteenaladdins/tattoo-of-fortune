export interface Artwork {
  id: string;
  path: string;
  downloadPath?: string;
  vibe: string[];
  size: "small" | "medium" | "large";
  title?: string;
}

// Mock tattoo designs for testing the full process
export const artworks: Artwork[] = [
  // SVGs present under static/fortunes
  {
    id: "cat_fortune",
    path: "/fortunes/cat_.svg",
    downloadPath: "/fortunes/cat_.svg",
    vibe: ["lucky", "mascot"],
    size: "medium",
    title: "Lucky Cat",
  },
  {
    id: "processed-tattoo-1",
    path: "/fortunes/processed-tattoo-1.svg",
    downloadPath: "/fortunes/processed-tattoo-1.svg",
    vibe: ["linework", "clean"],
    size: "small",
    title: "Fortune No. 1",
  },
  {
    id: "processed-tattoo-2",
    path: "/fortunes/processed-tattoo-2.svg",
    downloadPath: "/fortunes/processed-tattoo-2.svg",
    vibe: ["linework", "clean"],
    size: "small",
    title: "Fortune No. 2",
  },
  {
    id: "processed-tattoo-3",
    path: "/fortunes/processed-tattoo-3.svg",
    downloadPath: "/fortunes/processed-tattoo-3.svg",
    vibe: ["linework", "clean"],
    size: "small",
    title: "Fortune No. 3",
  },
  {
    id: "processed-tattoo-4",
    path: "/fortunes/processed-tattoo-4.svg",
    downloadPath: "/fortunes/processed-tattoo-4.svg",
    vibe: ["linework", "clean"],
    size: "small",
    title: "Fortune No. 4",
  },
  {
    id: "processed-tattoo-5",
    path: "/fortunes/processed-tattoo-5.svg",
    downloadPath: "/fortunes/processed-tattoo-5.svg",
    vibe: ["linework", "clean"],
    size: "small",
    title: "Fortune No. 5",
  },
  {
    id: "processed-tattoo-6",
    path: "/fortunes/processed-tattoo-6.svg",
    downloadPath: "/fortunes/processed-tattoo-6.svg",
    vibe: ["linework", "clean"],
    size: "small",
    title: "Fortune No. 6",
  },
  {
    id: "processed-tattoo-7",
    path: "/fortunes/processed-tattoo-7.svg",
    downloadPath: "/fortunes/processed-tattoo-7.svg",
    vibe: ["linework", "clean"],
    size: "small",
    title: "Fortune No. 7",
  },
  {
    id: "processed-tattoo-8",
    path: "/fortunes/processed-tattoo-8.svg",
    downloadPath: "/fortunes/processed-tattoo-8.svg",
    vibe: ["linework", "clean"],
    size: "small",
    title: "Fortune No. 8",
  },
  {
    id: "processed-tattoo-9",
    path: "/fortunes/processed-tattoo-9.svg",
    downloadPath: "/fortunes/processed-tattoo-9.svg",
    vibe: ["linework", "clean"],
    size: "small",
    title: "Fortune No. 9",
  },
  {
    id: "processed-tattoo-10",
    path: "/fortunes/processed-tattoo-10.svg",
    downloadPath: "/fortunes/processed-tattoo-10.svg",
    vibe: ["linework", "clean"],
    size: "small",
    title: "Fortune No. 10",
  },
];
