import { describe, expect, it } from "vitest";
import { generateToken, hashToken, isWellFormedToken } from "@/lib/token";

describe("token", () => {
  it("generates unique, well-formed 128-bit tokens", () => {
    const a = generateToken();
    expect(isWellFormedToken(a)).toBe(true);
    expect(a).not.toBe(generateToken());
  });

  it("hashes deterministically and does not contain the token", () => {
    const t = generateToken();
    expect(hashToken(t)).toBe(hashToken(t));
    expect(hashToken(t)).not.toContain(t);
  });

  it("rejects malformed tokens", () => {
    expect(isWellFormedToken("short")).toBe(false);
    expect(isWellFormedToken("a".repeat(21) + "!")).toBe(false);
  });
});

import { decryptToken, encryptToken } from "@/lib/token";

describe("token encryption", () => {
  it("round-trips and never stores the plaintext", () => {
    process.env.TOKEN_ENC_KEY = Buffer.alloc(32, 7).toString("base64");
    const t = generateToken();
    const enc = encryptToken(t);
    expect(enc).not.toContain(t);
    expect(decryptToken(enc)).toBe(t);
    expect(() => decryptToken(enc.slice(0, -2) + "AA")).toThrow();
  });
});
