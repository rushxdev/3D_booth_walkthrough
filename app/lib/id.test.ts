import { describe, expect, it } from "vitest";
import { newId } from "./id";

describe("newId", () => {
  it("returns unique non-empty ids", () => {
    const ids = new Set(Array.from({ length: 1000 }, newId));
    expect(ids.size).toBe(1000);
    expect([...ids].every((id) => id.length > 0)).toBe(true);
  });
});