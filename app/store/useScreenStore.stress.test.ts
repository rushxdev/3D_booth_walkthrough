import { beforeEach, describe, expect, it } from "vitest";
import { screenProblems, seededRandom, junk } from "./../lib/schemaInvariants.testutil";
import { useScreenStore } from "./useScreenStore";

beforeEach(() => useScreenStore.setState({ screens: [], selectedId: null }));

function expectConsistent(step: number, op: string) {
  const { screens, selectedId } = useScreenStore.getState();
  const ids = screens.map((s) => s.id);
  expect(new Set(ids).size, `duplicate ids after step ${step} (${op})`).toBe(ids.length);
  if (selectedId !== null) expect(ids, `dangling selection after step ${step} (${op})`).toContain(selectedId);
  for (const s of screens) expect(screenProblems(s), `screen ${s.id} after step ${step} (${op})`).toEqual([]);
}

describe("useScreenStore under abuse", () => {
  for (const seed of [1, 2, 3, 4, 5]) {
    it(`keeps every invariant through 600 random operations (seed ${seed})`, () => {
      const rand = seededRandom(seed);
      const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)];

      for (let step = 0; step < 600; step++) {
        const s = useScreenStore.getState();
        const existing = s.screens.map((x) => x.id);
        const someId = () => (existing.length && rand() < 0.9 ? pick(existing) : "no-such-id");
        const op = pick(["add", "add", "remove", "duplicate", "select", "update", "update", "update"]);

        if (op === "add") s.add(rand() < 0.5 ? (junk(rand) as never) : {});
        else if (op === "remove") s.remove(someId());
        else if (op === "duplicate") s.duplicate(someId());
        else if (op === "select") s.select(rand() < 0.2 ? null : someId());
        else s.update(someId(), { [pick(["position", "rotation", "width", "height", "resolution", "content", "name", "visible", "locked"])]: junk(rand) } as never);

        expectConsistent(step, op);
      }
    });
  }

  it("survives deleting and duplicating in a tight loop", () => {
    const s = useScreenStore.getState();
    for (let i = 0; i < 200; i++) {
      const id = s.add();
      s.duplicate(id);
      s.remove(id);
    }
    expect(useScreenStore.getState().screens).toHaveLength(200);
    expectConsistent(0, "loop");
  });
});