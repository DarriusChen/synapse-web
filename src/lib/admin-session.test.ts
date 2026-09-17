import { describe, expect, it } from "vitest";

import {
  createAdminSessionToken,
  equalHex,
  isAdminSessionToken,
  safeAdminPath,
} from "@/lib/admin-session";

describe("equalHex", () => {
  it("accepts identical tokens", () => {
    expect(equalHex("abc", "abc")).toBe(true);
  });

  it("rejects different tokens of the same length", () => {
    expect(equalHex("abc", "abd")).toBe(false);
  });
});

describe("safeAdminPath", () => {
  it("allows nested admin paths", () => {
    expect(safeAdminPath("/admin/topics/rag")).toBe("/admin/topics/rag");
  });

  it("rejects open redirects", () => {
    expect(safeAdminPath("https://evil.example")).toBe("/admin/topics");
    expect(safeAdminPath("//evil.example")).toBe("/admin/topics");
    expect(safeAdminPath("/map")).toBe("/admin/topics");
    expect(safeAdminPath("/admin/login")).toBe("/admin/topics");
  });
});

describe("admin session token", () => {
  it("accepts a token derived from the configured password", async () => {
    const previous = process.env.ADMIN_PASSWORD;
    process.env.ADMIN_PASSWORD = "study-group-secret";

    try {
      const token = await createAdminSessionToken("study-group-secret");
      expect(await isAdminSessionToken(token)).toBe(true);
      expect(await isAdminSessionToken("nope")).toBe(false);
    } finally {
      process.env.ADMIN_PASSWORD = previous;
    }
  });
});
