"use client";

import { useSceneStore } from "./../../store/useSceneStore";
import dynamic from "next/dynamic";
import { EmptyState } from "./EmptyState";
import { openModelFiles } from "./../../three/loaders/openModelFiles";
import { ViewportNotice } from "./ViewportNotice";
import { useFileDrop } from "./useFileDrop";
import { ViewportHints } from "./ViewportHints";
import { WalkOverlay } from "./WalkOverlay";
import { useState } from "react";
import { ErrorBoundary } from "./../ui/ErrorBoundary";
import { CanvasFallback } from "./CanvasFallback";
import { GraphicsNotice } from "./GraphicsNotice";
import { onCanvasCrash, resetSceneRuntime } from "@/app/runtime/sceneRuntime";

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

function DropOverlay() {
  return (
    <div className="pointer-events-none absolute inset-2 z-20 flex items-center justify-center rounded-md border border-dashed border-accent-text">
      <div className="rounded-md border border-line-strong bg-surface-1 px-3 py-1.5 text-sm text-fg">
        Drop a .glb or .gltf file to open
      </div>
    </div>
  );
}

export function Viewport() {
  const hasModel = useSceneStore((s) => s.model !== null);
  const clearModel = useSceneStore((s) => s.clearModel);
  const { dragging, handlers } = useFileDrop(openModelFiles);
  const [canvasKey, setCanvasKey] = useState(0);

  // A new key mounts a fresh Canvas, and with it a fresh WebGL context.
  const reload = () => {
    resetSceneRuntime();
    setCanvasKey((k) => k + 1);
  };

  return (
    <main className="relative min-h-0 min-w-0 flex-1 bg-surface-0" {...handlers}>
      <ErrorBoundary
        onError={onCanvasCrash}
        fallback={(error, reset) => (
          <CanvasFallback
            error={error}
            hasModel={hasModel}
            onReload={() => {
              reload();
              reset();
            }}
            onCloseModel={() => {
              clearModel();
              reload();
              reset();
            }}
          />
        )}
      >
        <SceneCanvas key={canvasKey} />
      </ErrorBoundary>
      {!hasModel && <EmptyState />}
      <ViewportNotice />
      <GraphicsNotice onReload={reload} />
      <WalkOverlay />
      <ViewportHints />
      {dragging && <DropOverlay />}
    </main>
  );
}