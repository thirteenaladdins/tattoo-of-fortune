import { createHash, createHmac, randomBytes } from "node:crypto";

type CommitRecord = {
  id: string;
  serverSeed: string; // hex
  nonce: string; // hex
  hash: string; // sha256(serverSeed)
  used: boolean;
};

// In-memory store (resets on restart)
const commits: Map<string, CommitRecord> = new Map();

function randomHex(bytes: number): string {
  return randomBytes(bytes).toString("hex");
}

export function createCommit(): { id: string; nonce: string; hash: string } {
  const id = randomHex(16);
  const serverSeed = randomHex(32);
  const nonce = randomHex(8);
  const hash = createHash("sha256").update(serverSeed).digest("hex");

  commits.set(id, { id, serverSeed, nonce, hash, used: false });
  return { id, nonce, hash };
}

export function deriveIndex(
  serverSeed: string,
  clientSeed: string,
  nonce: string,
  n: number,
): number {
  const msg = `${clientSeed}:${nonce}`;
  const mac = createHmac("sha256", Buffer.from(serverSeed, "hex"))
    .update(msg)
    .digest();
  // Use first 8 bytes as uint64, mod n
  const hi = mac.readUInt32BE(0);
  const lo = mac.readUInt32BE(4);
  const combined = (hi * 0x100000000 + lo) >>> 0; // fits in JS number
  return n > 0 ? combined % n : 0;
}

export function resolveRoll(
  id: string,
  clientSeed: string,
  n: number,
): { index: number; hash: string; nonce: string } {
  const rec = commits.get(id);
  if (!rec) {
    throw new Error("Invalid commit id");
  }
  if (rec.used) {
    // Allow re-resolution to keep deterministic output, don't mutate again
    const index = deriveIndex(rec.serverSeed, clientSeed, rec.nonce, n);
    return { index, hash: rec.hash, nonce: rec.nonce };
  }
  const index = deriveIndex(rec.serverSeed, clientSeed, rec.nonce, n);
  rec.used = true;
  commits.set(id, rec);
  return { index, hash: rec.hash, nonce: rec.nonce };
}

export function revealCommit(
  id: string,
): { serverSeed: string; nonce: string; hash: string } {
  const rec = commits.get(id);
  if (!rec) {
    throw new Error("Invalid commit id");
  }
  return { serverSeed: rec.serverSeed, nonce: rec.nonce, hash: rec.hash };
}

