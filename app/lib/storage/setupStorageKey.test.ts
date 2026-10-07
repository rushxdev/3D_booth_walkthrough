import { describe, expect, it } from "vitest";
import { listSetupKeys, SETUP_PREFIX, type IterableStorage } from "./setupStorage";

function memory(initial: Record<string, string>): IterableStorage {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
    key: (i) => [...data.keys()][i] ?? null,
    get length() {
      return data.size;
    },
  };
}

describe("listSetupKeys", () => {
  it("returns only setup keys, without the prefix", () => {
    const s = memory({
      [SETUP_PREFIX + "aaa"]: "{}",
      [SETUP_PREFIX + "bbb"]: "{}",
      "booth:last-session": "{}",
      other: "x",
    });
    expect(listSetupKeys(s).sort()).toEqual(["aaa", "bbb"]);
  });

  it("returns nothing for missing or throwing storage", () => {
    expect(listSetupKeys(null)).toEqual([]);
    const broken = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      key: () => {
        throw new Error("x");
      },
      length: 1,
    } as IterableStorage;
    expect(listSetupKeys(broken)).toEqual([]);
  });
});