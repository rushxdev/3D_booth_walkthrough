"use client";

import { Box, FolderOpen, X } from "lucide-react";
import { IconButton } from "./../../components/ui/IconButton";
import { useSceneStore } from "./../../store/useSceneStore";
import { openModelDialog } from "./../../three/loaders/openModelFiles";

export function Toolbar() {
  const hasModel = useSceneStore((s) => s.model !== null);
  const loadSample = useSceneStore((s) => s.loadSample);
  const clearModel = useSceneStore((s) => s.clearModel);

  return (
    <header className="flex h-(--toolbar-h) shrink-0 items-center gap-1 border-b border-line bg-surface-1 px-3">
      <span className="mr-2 text-sm font-medium text-fg">Booth Viewer</span>
      
      <IconButton icon={FolderOpen} label="Open model" onClick={openModelDialog} />
      <IconButton icon={Box} label="Load sample" onClick={loadSample} />
      <IconButton icon={X} label="Close model" onClick={clearModel} disabled={!hasModel} />

      <div className="flex-1" />
    </header>
  );
}