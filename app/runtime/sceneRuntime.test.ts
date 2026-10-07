import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./../three/collision/colliderCache", () => ({ clearColliderCache: vi.fn() }));

import { clearColliderCache } from "./../three/collision/colliderCache";
import { useGraphicsStore } from "./../store/useGraphicsStore";
import { useSceneStore } from "./../store/useSceneStore";
import { useUiStore } from "./../store/useUiStore";
import { orbitView } from "./../three/controls/orbitView";
import { player } from "./../three/controls/player";
import { onCanvasCrash, resetSceneRuntime } from "./sceneRuntime";

beforeEach(() => {
  vi.clearAllMocks();
  useSceneStore.setState({ model: { kind: "sample" } });
  useUiStore.setState({ presentation: false, mode: "overview", walkLocked: false });
});

describe("resetSceneRuntime", () => {
  it("clears the singletons and returns to Overview", () => {
    player.position.set(3, 1, 2);
    player.velocity.set(1, 1, 1);
    player.grounded = true;
    orbitView.valid = true;
    useUiStore.setState({ mode: "walk", walkLocked: true });
    useGraphicsStore.getState().markLost();

    resetSceneRuntime();

    expect(clearColliderCache).toHaveBeenCalled();
    expect(player.position.toArray()).toEqual([0, 0, 0]);
    expect(player.velocity.toArray()).toEqual([0, 0, 0]);
    expect(player.grounded).toBe(false);
    expect(orbitView.valid).toBe(false);
    expect(useUiStore.getState()).toMatchObject({ mode: "overview", walkLocked: false });
    expect(useGraphicsStore.getState().status).toBe("ok");
  });
});

describe("onCanvasCrash", () => {
  it("leaves presentation and Walk so the UI stays reachable", () => {
    useUiStore.setState({ presentation: true, mode: "walk", walkLocked: true });
    onCanvasCrash();
    expect(useUiStore.getState()).toMatchObject({ presentation: false, mode: "overview", walkLocked: false });
  });
});