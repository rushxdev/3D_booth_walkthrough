"use client";

import { useEffect } from "react";
import { Toolbar } from "./Toolbar";
import { Viewport } from "./Viewport";
import { SidePanel } from "./SidePanel";
import { PersistenceHost } from "./PersistenceHost";
import { PresentationBar } from "./PresentationBar";
import { TooltipProvider } from "./../ui/Tooltip";
import { Shortcuts } from "./Shortcuts";
import { usePresenting } from "@/app/presentation/usePresenting";
import { startPresentationGuard } from "@/app/presentation/presentationControl";
import { startVideoSourceSync } from "@/app/three/screens/Video/videoSync";

export function AppShell() {
  const presenting = usePresenting();

  // Here, not in Toolbar: the toolbar unmounts while presenting.
  useEffect(() => startVideoSourceSync(), []);
  useEffect(() => startPresentationGuard(), []);

  // Viewport must keep its position in this tree, or the canvas remounts.
  return (
    <TooltipProvider>
      <Shortcuts />
      <div className="flex h-full flex-col">
        {!presenting && <Toolbar />}
        <PersistenceHost />
        <div className="flex min-h-0 flex-1">
          <Viewport />
          {!presenting && <SidePanel />}
        </div>
      </div>
      <PresentationBar />
    </TooltipProvider>
  );
}