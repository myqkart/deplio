import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isWithinCooldown } from "./cooldown";

describe("isWithinCooldown", () => {
  it("returns false when no prior deployment", () => {
    assert.equal(isWithinCooldown(null), false);
  });

  it("returns true within 10s", () => {
    const now = Date.parse("2026-03-24T12:00:10.000Z");
    assert.equal(
      isWithinCooldown("2026-03-24T12:00:05.000Z", now),
      true
    );
  });

  it("returns false after 10s", () => {
    const now = Date.parse("2026-03-24T12:00:15.000Z");
    assert.equal(
      isWithinCooldown("2026-03-24T12:00:00.000Z", now),
      false
    );
  });
});
