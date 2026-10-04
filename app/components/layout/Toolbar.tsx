"use client";

import { Box, FolderOpen, X, Footprints, Maximize, Orbit, RotateCcw } from "lucide-react";
import { IconButton } from "./../../components/ui/IconButton";
import { useSceneStore } from "./../../store/useSceneStore";
import { openModelDialog } from "./../../three/loaders/openModelFiles";
import { SegmentedControl } from "./../../components/ui/SegmentedControls";
import { isViewMode, useUiStore } from "./../../store/useUiStore";

export function Toolbar() {
  const hasModel = useSceneStore((s) => s.model !== null);
  const loadSample = useSceneStore((s) => s.loadSample);
  const clearModel = useSceneStore((s) => s.clearModel);
  const mode = useUiStore((s) => s.mode);
  const setMode = useUiStore((s) => s.setMode);
  const requestFrame = useUiStore((s) => s.requestFrame);
  const requestReset = useUiStore((s) => s.requestReset);

  return (
    <header className="flex h-(--toolbar-h) shrink-0 items-center gap-1 border-b border-line bg-surface-1 px-3">
      <span className="mr-2 text-sm font-medium text-fg">Booth Viewer</span>
      
      <IconButton icon={FolderOpen} label="Open model" onClick={openModelDialog} />
      <IconButton icon={Box} label="Load sample" onClick={loadSample} />
      <IconButton icon={X} label="Close model" onClick={clearModel} disabled={!hasModel} />

      <div className="flex-1" />
      <IconButton icon={RotateCcw} label="Reset position" shortcut="R" onClick={requestReset} disabled={mode !== "walk"} />
      <IconButton icon={Maximize} label="Frame model" shortcut="F" onClick={requestFrame} disabled={mode !== "overview"} />
      <SegmentedControl
        aria-label="Camera mode"
        value={mode}
        onValueChange={(v) => isViewMode(v) && setMode(v)}
        options={[
          { value: "overview", label: "Overview", icon: Orbit },
          { value: "walk", label: "Walk", icon: Footprints, disabled: !hasModel, hint: "Load a model first" },
        ]}
      />
    </header>
  );
}