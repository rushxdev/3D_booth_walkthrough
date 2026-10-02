import { Toolbar } from "./Toolbar";
import { Viewport } from "./Viewport";
import { SidePanel } from "./SidePanel";
import { TooltipProvider } from "./../ui/Tooltip";
import { Shortcuts } from "./Shortcuts";

export function AppShell() {
  return (
    <TooltipProvider>
      <Shortcuts />
      <div className="flex h-full flex-col">
        <Toolbar />
        <div className="flex min-h-0 flex-1">
          <Viewport />
          <SidePanel />
        </div>
      </div>
    </TooltipProvider>
  );
}