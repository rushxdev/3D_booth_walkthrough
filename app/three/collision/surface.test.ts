import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { MAX_SLOPE_DEG } from "./constants";
import { classifyNormalY, orientNormal } from "./surface";

const ny = (deg: number) => Math.cos((deg * Math.PI) / 180); // normal Y of a surface tilted by deg

describe("classifyNormalY", () => {
  it("treats flat and gentle surfaces as floor", () => {
    expect(classifyNormalY(1)).toBe("floor");
    expect(classifyNormalY(ny(30))).toBe("floor");
  });

  it("uses the same limit as the walkable slope", () => {
    expect(classifyNormalY(ny(MAX_SLOPE_DEG))).toBe("floor"); // exactly at the limit
    expect(classifyNormalY(ny(MAX_SLOPE_DEG + 1))).toBe("wall");
    expect(classifyNormalY(ny(48))).toBe("floor"); // the plan's 0.7 rule would have said wall
  });

  it("treats vertical and mildly overhanging surfaces as wall", () => {
    expect(classifyNormalY(0)).toBe("wall");
    expect(classifyNormalY(-0.4)).toBe("wall");
  });

  it("treats downward-facing surfaces as ceiling", () => {
    expect(classifyNormalY(-0.5)).toBe("ceiling");
    expect(classifyNormalY(-1)).toBe("ceiling");
  });
});

describe("orientNormal", () => {
  const down = new THREE.Vector3(0, -1, 0);

  it("keeps a normal that already faces the mover", () => {
    expect(orientNormal(new THREE.Vector3(0, 1, 0), down).y).toBe(1);
  });

  it("flips a back-facing normal, so a wrongly wound floor still reads as floor", () => {
    const n = orientNormal(new THREE.Vector3(0, -1, 0), down);
    expect(n.y).toBe(1);
    expect(classifyNormalY(n.y)).toBe("floor");
  });
});