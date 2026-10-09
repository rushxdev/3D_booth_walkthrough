import { beforeEach, describe, expect, it } from "vitest";
import { useHelpStore } from "./useHelpStore";

beforeEach(() => useHelpStore.getState().close());

describe("useHelpStore", () => {
  it("toggles and closes", () => {
    useHelpStore.getState().toggle();
    expect(useHelpStore.getState().open).toBe(true);
    useHelpStore.getState().toggle();
    expect(useHelpStore.getState().open).toBe(false);
    useHelpStore.getState().toggle();
    useHelpStore.getState().close();
    useHelpStore.getState().close();
    expect(useHelpStore.getState().open).toBe(false);
  });
});