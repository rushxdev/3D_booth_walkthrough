import { ModelInfo } from "../panels/ModelInfo";
import { ScreenList } from "../panels/ScreenList";
import { SizeSection, TransformSection } from "../panels/TransformSection";
import { WalkSettings } from "../panels/WalkSettings";

// SidePanel.tsx
export function SidePanel() {
  return (
    <aside
      aria-label="Settings"
      className="w-(--panel-w) shrink-0 overflow-y-auto border-l border-line bg-surface-1"
    >
      <div className="flex h-8 items-center border-b border-line px-3 text-xs font-medium text-fg-secondary">
        Properties
      </div>
      <ScreenList />
      <TransformSection />
      <SizeSection />
      <ModelInfo />
      <WalkSettings />
    </aside>
  );
}