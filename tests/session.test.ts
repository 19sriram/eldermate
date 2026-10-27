import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));

beforeAll(() => {
  process.env.SESSION_SECRET = "test-secret";
});

describe("session cookie", () => {
  it("round-trips and rejects tampering", async () => {
    const { makeSessionValue, readSessionValue } = await import("@/lib/session");
    const v = makeSessionValue("owner1");
    expect(readSessionValue(v)).toBe("owner1");
    expect(readSessionValue(v.replace("owner1", "owner2"))).toBeNull();
    expect(readSessionValue(undefined)).toBeNull();
  });
});
