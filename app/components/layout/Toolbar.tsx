"use client";

import { Box, FolderOpen, X, Footprints, Maximize, Orbit, RotateCcw, Monitor, Magnet, Move3d, Rotate3d, Crosshair } from "lucide-react";
import { IconButton } from "./../../components/ui/IconButton";
import { useSceneStore } from "./../../store/useSceneStore";
import { openModelDialog } from "./../../three/loaders/openModelFiles";
import { SegmentedControl } from "./../../components/ui/SegmentedControls";
import { isViewMode, useUiStore, isGizmoMode } from "./../../store/useUiStore";
import { addScreenInView } from "@/app/three/screens/addScreenInView";
import { useScreenStore } from "@/app/store/useScreenStore";

export function Toolbar() {
  const hasModel = useSceneStore((s) => s.model !== null);
  const loadSample = useSceneStore((s) => s.loadSample);
  const clearModel = useSceneStore((s) => s.clearModel);
  const mode = useUiStore((s) => s.mode);
  const setMode = useUiStore((s) => s.setMode);
  const requestFrame = useUiStore((s) => s.requestFrame);
  const requestReset = useUiStore((s) => s.requestReset);
  const gizmoMode = useUiStore((s) => s.gizmoMode);
  const setGizmoMode = useUiStore((s) => s.setGizmoMode);
  const snap = useUiStore((s) => s.snap);
  const setSnap = useUiStore((s) => s.setSnap);
  const placing = useUiStore((s) => s.placing);
  const setPlacing = useUiStore((s) => s.setPlacing);
  const canPlace = useScreenStore((s) => {
    const selected = s.screens.find((x) => x.id === s.selectedId);
    return !!selected && !selected.locked;
  });
  const overview = mode === "overview";

  return (
    <header className="flex h-(--toolbar-h) shrink-0 items-center gap-1 border-b border-line bg-surface-1 px-3">
      <span className="mr-2 text-sm font-medium text-fg">Booth Viewer</span>
      
      <IconButton icon={FolderOpen} label="Open model" onClick={openModelDialog} />
      <IconButton icon={Box} label="Load sample" onClick={loadSample} />
      <IconButton icon={X} label="Close model" onClick={clearModel} disabled={!hasModel} />
      <IconButton icon={Monitor} label="Add screen" onClick={addScreenInView} disabled={!hasModel} />

      <div className="mx-1 h-4 w-px bg-line" />
      <SegmentedControl
        aria-label="Gizmo tool"
        iconOnly
        disabled={!overview}
        value={gizmoMode}
        onValueChange={(v) => isGizmoMode(v) && setGizmoMode(v)}
        options={[
          { value: "translate", label: "Move", icon: Move3d, shortcut: "W" },
          { value: "rotate", label: "Rotate", icon: Rotate3d, shortcut: "E" },
        ]}
      />
      <IconButton icon={Magnet} label="Snap to 5 cm and 5°" active={snap} disabled={!overview} onClick={() => setSnap(!snap)} />
      <IconButton
        icon={Crosshair}
        label="Place on surface"
        shortcut="S"
        active={placing}
        disabled={!overview || !canPlace}
        onClick={() => setPlacing(!placing)}
      />

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