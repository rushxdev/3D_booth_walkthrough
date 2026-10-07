import { beforeEach, describe, expect, it } from "vitest";
import { usePersistenceStore } from "./usePersistenceStore";

beforeEach(() => usePersistenceStore.getState().reset());

describe("usePersistenceStore", () => {
  it("starts idle with nothing to show", () => {
    expect(usePersistenceStore.getState()).toMatchObject({
      saveState: "idle",
      errorMessage: null,
      notice: null,
      restoring: false,
    });
  });

  it("an error then a success clears the message", () => {
    const s = usePersistenceStore.getState();
    s.markError("full");
    expect(usePersistenceStore.getState()).toMatchObject({ saveState: "error", errorMessage: "full" });
    s.markSaved();
    expect(usePersistenceStore.getState()).toMatchObject({ saveState: "saved", errorMessage: null });
  });

  it("tracks the notice and the restoring flag independently", () => {
    const s = usePersistenceStore.getState();
    s.setRestoring(true);
    s.setNotice("Restored previous session");
    expect(usePersistenceStore.getState()).toMatchObject({ restoring: true, notice: "Restored previous session" });
    s.setNotice(null);
    expect(usePersistenceStore.getState().notice).toBeNull();
  });
});