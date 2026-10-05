import { beforeEach, describe, expect, it } from "vitest";
import { useScreenStore } from "./../../store/useScreenStore";
import { useUiStore } from "./../../store/useUiStore";
import { cameraPose } from "../controls/cameraPose";
import { saveOrbitView } from "../controls/orbitView";
import { addScreenInView } from "./addScreenInView";

const last = () => useScreenStore.getState().screens.at(-1)!;

describe("addScreenInView", () => {
  beforeEach(() => {
    useScreenStore.setState({ screens: [], selectedId: null });
    useUiStore.setState({ mode: "overview" });
  });

  it("walk: 2.5 m ahead at eye height, facing the player", () => {
    useUiStore.setState({ mode: "walk" });
    cameraPose.position.set(0, 1.6, 0);
    cameraPose.direction.set(0, 0, -1);
    addScreenInView();
    expect(last().position).toEqual([0, 1.5, -2.5]);
    expect(last().rotation[1]).toBeCloseTo(0, 10);
  });

  it("walk: follows the heading and turns to face back", () => {
    useUiStore.setState({ mode: "walk" });
    cameraPose.position.set(0, 1.6, 0);
    cameraPose.direction.set(1, 0, 0);
    addScreenInView();
    expect(last().position[0]).toBeCloseTo(2.5, 10);
    expect(last().rotation[1]).toBeCloseTo(-Math.PI / 2, 10);
  });

  it("walk: copes with looking straight down", () => {
    useUiStore.setState({ mode: "walk" });
    cameraPose.position.set(0, 1.6, 0);
    cameraPose.direction.set(0, -1, 0);
    addScreenInView();
    expect(Number.isFinite(last().position[2])).toBe(true);
    expect(last().position[2]).toBeCloseTo(-2.5, 10);
  });

  it("overview: at the orbit focus, facing the camera", () => {
    cameraPose.position.set(10, 6, 10);
    cameraPose.direction.set(-1, -0.3, -1);
    saveOrbitView(cameraPose.position, { x: 0, y: 1.5, z: 0 } as never, "k", 0);
    addScreenInView();
    expect(last().position).toEqual([0, 1.5, 0]);
    expect(last().rotation[1]).toBeCloseTo(Math.PI / 4, 10);
  });
});