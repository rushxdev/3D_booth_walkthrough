import * as THREE from "three";
import { beforeEach, describe, expect, it } from "vitest";
import { cameraPose } from "./../three/controls/cameraPose";
import { orbitView, saveOrbitView } from "./../three/controls/orbitView";
import { player } from "./../three/controls/player";
import {
  captureCamera,
  clearCameraResume,
  headingOf,
  restoreCamera,
  takeOrbitResume,
  takeWalkResume,
} from "./cameraResume";

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

beforeEach(() => {
  clearCameraResume();
  orbitView.valid = false;
  orbitView.modelKey = "";
  orbitView.frameTick = -1;
  player.position.set(0, 0, 0);
  cameraPose.direction.set(0, 0, -1);
});

describe("headingOf", () => {
  it("keeps only the horizontal part, normalized", () => {
    const [x, z] = headingOf(v(3, 5, 4));
    expect(x).toBeCloseTo(0.6, 6);
    expect(z).toBeCloseTo(0.8, 6);
  });
  it("falls back to -Z when looking straight up or down", () => {
    expect(headingOf(v(0, 1, 0))).toEqual([0, -1]);
    expect(headingOf(v(0, -1, 0))).toEqual([0, -1]);
  });
});

describe("captureCamera", () => {
  it("copies the orbit view and does not alias it", () => {
    saveOrbitView(v(1, 2, 3), v(4, 5, 6), "m", 0);
    const snap = captureCamera("overview", "k");
    expect(snap.orbit).toEqual({ position: [1, 2, 3], target: [4, 5, 6] });
    expect(snap.walk).toBeNull();
    orbitView.position.set(9, 9, 9);
    expect(snap.orbit?.position).toEqual([1, 2, 3]);
  });

  it("has no orbit when none was ever saved", () => {
    expect(captureCamera("overview", "k").orbit).toBeNull();
  });

  it("captures feet and heading only in walk mode", () => {
    player.position.set(1, 0.5, -2);
    cameraPose.direction.set(1, 0, 0);
    expect(captureCamera("walk", "k").walk).toEqual({ feet: [1, 0.5, -2], heading: [1, 0] });
    expect(captureCamera("overview", "k").walk).toBeNull();
  });

  it("ignores a non-finite player position", () => {
    player.position.set(NaN, 0, 0);
    expect(captureCamera("walk", "k").walk).toBeNull();
  });
});

describe("restoreCamera", () => {
  const snap = {
    identityKey: "k",
    orbit: { position: [1, 2, 3] as [number, number, number], target: [4, 5, 6] as [number, number, number] },
    walk: { feet: [7, 0, 8] as [number, number, number], heading: [0, -1] as [number, number] },
  };

  it("writes orbitView with the current frame tick, so a Frame press cannot discard it", () => {
    saveOrbitView(v(0, 0, 0), v(0, 0, 0), "m", 2);
    restoreCamera(snap, { identityKey: "k", frameTick: 5, finalMode: "walk" });
    expect(orbitView.position.toArray()).toEqual([1, 2, 3]);
    expect(orbitView.target.toArray()).toEqual([4, 5, 6]);
    expect(orbitView.frameTick).toBe(5);
    expect(orbitView.modelKey).toBe("m");
  });

  it("queues only the pose for the mode being returned to, once", () => {
    saveOrbitView(v(0, 0, 0), v(0, 0, 0), "m", 0);
    restoreCamera(snap, { identityKey: "k", frameTick: 0, finalMode: "overview" });
    expect(takeWalkResume()).toBeNull();
    expect(takeOrbitResume()).toEqual(snap.orbit);
    expect(takeOrbitResume()).toBeNull();

    restoreCamera(snap, { identityKey: "k", frameTick: 0, finalMode: "walk" });
    expect(takeOrbitResume()).toBeNull();
    expect(takeWalkResume()).toEqual(snap.walk);
  });

  it("does nothing for another model or no snapshot, and drops stale poses", () => {
    saveOrbitView(v(0, 0, 0), v(0, 0, 0), "m", 0);
    restoreCamera(snap, { identityKey: "k", frameTick: 0, finalMode: "overview" });
    restoreCamera(snap, { identityKey: "other", frameTick: 0, finalMode: "overview" });
    expect(takeOrbitResume()).toBeNull();
    expect(orbitView.position.toArray()).toEqual([1, 2, 3]); // from the first call only

    restoreCamera(null, { identityKey: "k", frameTick: 0, finalMode: "walk" });
    expect(takeWalkResume()).toBeNull();
  });
});