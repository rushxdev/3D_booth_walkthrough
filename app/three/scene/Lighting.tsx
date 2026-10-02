import { Environment, Lightformer } from "@react-three/drei";

export function Lighting() {
  return (
    <>
      <hemisphereLight args={["#ffffff", "#3a3d44", 0.35]} />
      <directionalLight position={[8, 12, 6]} intensity={1.2} />

      {/* Procedural studio environment, rendered once, fully offline */}
      <Environment resolution={256} frames={1} environmentIntensity={0.5}>
        {/* top softbox, faces down */}
        <Lightformer form="rect" intensity={2.5} position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[12, 12, 1]} />
        {/* side fills, face inward */}
        <Lightformer form="rect" intensity={1} position={[-6, 2, 0]} rotation={[0, Math.PI / 2, 0]} scale={[12, 4, 1]} />
        <Lightformer form="rect" intensity={1} position={[6, 2, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[12, 4, 1]} />
        {/* front and back fills */}
        <Lightformer form="rect" intensity={0.8} position={[0, 2, -6]} scale={[12, 4, 1]} />
        <Lightformer form="rect" intensity={0.8} position={[0, 2, 6]} rotation={[0, Math.PI, 0]} scale={[12, 4, 1]} />
      </Environment>
    </>
  );
}