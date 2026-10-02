import { Grid } from "@react-three/drei";
import * as THREE from "three";

type FloorProps = { showGrid?: boolean };

export function Floor({ showGrid = true }: FloorProps) {
  return (
    <>
      {/* Ground, slightly below y=0 so the grid never z-fights with it */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#202226" roughness={1} metalness={0} />
      </mesh>

      {showGrid && (
        <Grid
          infiniteGrid
          side={THREE.DoubleSide}
          cellSize={1}
          cellThickness={0.6}
          cellColor="#2f3237"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#4a4e55"
          fadeDistance={60}
          fadeStrength={1.5}
        />
      )}
    </>
  );
}