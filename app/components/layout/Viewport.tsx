"use client";

import { useSceneStore } from "./../../store/useSceneStore";
import dynamic from "next/dynamic";
import { EmptyState } from "./EmptyState";

function ViewportMessage({ children }: { children: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center text-sm text-fg-secondary">
      {children}
    </div>
  );
}

// ssr: false is only allowed from a client component, hence "use client" above.
const SceneCanvas = dynamic(() => import("./../../three/scene/SceneCanvas"), {
  ssr: false,
  loading: () => <ViewportMessage>Loading viewport...</ViewportMessage>,
});

export function Viewport() {
  const hasModel = useSceneStore((s) => s.model !== null);
  return (
    <main className="relative min-h-0 min-w-0 flex-1 bg-surface-0">
      <SceneCanvas />
      {!hasModel && <EmptyState />}
    </main>
  );
}