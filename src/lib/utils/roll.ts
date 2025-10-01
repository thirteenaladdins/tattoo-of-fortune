import type { Artwork } from "../data/artworks";

/**
 * Pure function to select a random artwork from the array
 * TODO: Extend with rules/weights for different selection logic
 */
export function rollArtwork(artworks: Artwork[]): Artwork {
  if (artworks.length === 0) {
    throw new Error("No artworks available");
  }
  const randomIndex = Math.floor(Math.random() * artworks.length);
  return artworks[randomIndex];
}

/**
 * TODO: Future enhancement - weighted selection based on:
 * - Size preference
 * - Vibe filtering
 * - Rarity system
 * - User history
 */
export function rollWeightedArtwork(
  artworks: Artwork[],
  preferences?: {
    size?: "small" | "medium" | "large";
    vibes?: string[];
  },
): Artwork {
  // For MVP, just return random selection
  // TODO: Implement weighted logic
  return rollArtwork(artworks);
}

export async function fetchAvailableArtworks(): Promise<Artwork[]> {
  const res = await fetch("/api/inventory");
  if (!res.ok) {
    throw new Error("Failed to load inventory");
  }
  const data: { availableIds: string[] } = await res.json();
  // In the MVP, map available IDs back to static artwork metadata
  const { artworks } = await import("$lib/data/artworks");
  return artworks.filter((a) => data.availableIds.includes(a.id));
}

// Provably-fair roll helpers
export async function startFairCommit(): Promise<{ id: string; nonce: string; hash: string }> {
  const res = await fetch("/api/fairness");
  if (!res.ok) throw new Error("Failed to start commit");
  return res.json();
}

export async function resolveFairIndex(
  id: string,
  n: number,
): Promise<{ index: number; hash: string; nonce: string; clientSeed: string }> {
  // Generate clientSeed with crypto.getRandomValues
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const clientSeed = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const res = await fetch("/api/fairness", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id, clientSeed, n }),
  });
  if (!res.ok) throw new Error("Failed to resolve index");
  const data = await res.json();
  return { ...data, clientSeed };
}

export async function revealFairSeed(id: string): Promise<{ serverSeed: string; nonce: string; hash: string }> {
  const res = await fetch("/api/fairness", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Failed to reveal seed");
  return res.json();
}
