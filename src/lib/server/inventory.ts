import { randomUUID } from "node:crypto";
import { artworks } from "$lib/data/artworks";

type InventoryRecord = {
  id: string;
  stock: number;
};

// In-memory inventory (resets on server restart)
const initialStockPerArtwork = 1;

const inventory: Map<string, InventoryRecord> = new Map(
  artworks.map((art) => [art.id, { id: art.id, stock: initialStockPerArtwork }]),
);

type DownloadTokenRecord = {
  artworkId: string;
  expiresAt: number;
  remainingUses: number;
};

const downloadTokens = new Map<string, DownloadTokenRecord>();

// Map a Stripe session to a minted token so the client can claim it post-redirect
const sessionToToken = new Map<string, { token: string; artworkId: string }>();

export function getInventorySummary(): {
  total: number;
  available: number;
  sold: number;
  availableIds: string[];
} {
  const records = Array.from(inventory.values());
  const total = records.reduce((sum, r) => sum + initialStockPerArtwork, 0);
  const available = records.reduce((sum, r) => sum + (r.stock > 0 ? 1 : 0), 0);
  const sold = total - available;
  const availableIds = records.filter((r) => r.stock > 0).map((r) => r.id);
  return { total, available, sold, availableIds };
}

export function purchaseArtwork(
  id: string,
):
  | { success: true; token: string }
  | { success: false; error: string } {
  const record = inventory.get(id);
  if (!record) {
    return { success: false, error: "Artwork not found" };
  }
  if (record.stock <= 0) {
    return { success: false, error: "Artwork out of stock" };
  }
  record.stock -= 1;
  inventory.set(id, record);
  const token = randomUUID();
  downloadTokens.set(token, {
    artworkId: id,
    expiresAt: Date.now() + 1000 * 60 * 30, // 30 minutes
    remainingUses: 3,
  });
  return { success: true, token };
}

// Finalize a purchase after payment confirmation (e.g., via Stripe webhook)
export function finalizePurchase(
  id: string,
): { success: true; token: string } | { success: false; error: string } {
  const record = inventory.get(id);
  if (!record) {
    return { success: false, error: "Artwork not found" };
  }
  if (record.stock <= 0) {
    return { success: false, error: "Artwork out of stock" };
  }
  record.stock -= 1;
  inventory.set(id, record);
  const token = randomUUID();
  downloadTokens.set(token, {
    artworkId: id,
    expiresAt: Date.now() + 1000 * 60 * 30, // 30 minutes
    remainingUses: 3,
  });
  return { success: true, token };
}

export function setSessionToken(sessionId: string, token: string, artworkId: string) {
  sessionToToken.set(sessionId, { token, artworkId });
}

export function getAndConsumeSessionToken(sessionId: string): { token: string; artworkId: string } | null {
  const entry = sessionToToken.get(sessionId);
  if (!entry) return null;
  sessionToToken.delete(sessionId);
  return entry;
}

export function consumeDownloadToken(token: string): { artworkId: string } | null {
  const record = downloadTokens.get(token);
  if (!record) {
    return null;
  }
  if (record.expiresAt < Date.now()) {
    downloadTokens.delete(token);
    return null;
  }
  if (record.remainingUses <= 1) {
    downloadTokens.delete(token);
  } else {
    downloadTokens.set(token, {
      ...record,
      remainingUses: record.remainingUses - 1,
    });
  }
  return { artworkId: record.artworkId };
}

export function getArtworkById(id: string) {
  return artworks.find((art) => art.id === id);
}
