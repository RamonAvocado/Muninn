import { expect, test } from "bun:test";
import { decryptToken, encryptToken } from "./github-sync";

test("token encryption round-trips and isn't plain text", () => {
  process.env.TOKEN_SECRET = "test-secret";
  const stored = encryptToken("ghp_abc123");
  expect(stored).not.toContain("ghp_abc123");
  expect(decryptToken(stored)).toBe("ghp_abc123");
  process.env.TOKEN_SECRET = "other-secret";
  expect(() => decryptToken(stored)).toThrow();
});
