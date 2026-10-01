import { Toolbar } from "./Toolbar";
import { Viewport } from "./Viewport";
import { SidePanel } from "./SidePanel";

export function AppShell() {
  return (
    <div className="flex h-full flex-col">
      <Toolbar />
      <div className="flex min-h-0 flex-1">
        <Viewport />
        <SidePanel />
      </div>
    </div>
  );
}