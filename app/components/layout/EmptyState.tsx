"use client";

import { Box, FolderOpen } from "lucide-react";
import { Button } from "./../../components/ui/Button";
import { useSceneStore } from "./../../store/useSceneStore";
import { openModelDialog } from "@/app/three/loaders/openModelFiles";

export function EmptyState() {
  const loadSample = useSceneStore((s) => s.loadSample);

  return (
    // Wrapper ignores pointer events so the canvas behind stays interactive;
    // only the card itself captures them.
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="pointer-events-auto w-80 rounded-md border border-line-strong bg-surface-1 p-4">
        <h2 className="text-base font-medium text-fg">No model loaded</h2>
        <p className="mt-1 text-sm text-fg-secondary">
          Open a .glb or .gltf file, or load the sample booth to try the tool.
        </p>
        <div className="mt-3 flex gap-2">
          <Button variant="primary" icon={FolderOpen} onClick={openModelDialog}>
            Open model
          </Button>
          <Button icon={Box} onClick={loadSample}>
            Load sample
          </Button>
        </div>
      </div>
    </div>
  );
}