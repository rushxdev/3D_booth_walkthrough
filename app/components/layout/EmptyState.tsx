"use client";

import { Box, FolderOpen } from "lucide-react";
import { Button } from "./../../components/ui/Button";
import { useSceneStore } from "./../../store/useSceneStore";

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
          {/* Flip these two variants in step 3.1, when Open model becomes the main action */}
          <Button variant="primary" icon={Box} onClick={loadSample}>
            Load sample
          </Button>
          <Button icon={FolderOpen} disabled>
            Open model
          </Button>
        </div>
      </div>
    </div>
  );
}