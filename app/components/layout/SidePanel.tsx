import { ModelInfo } from "../panels/ModelInfo";
import { ScreenList } from "../panels/ScreenList";
import { SizeSection, TransformSection } from "../panels/TransformSection";
import { WalkSettings } from "../panels/WalkSettings";
import { ContentSection } from "../panels/ContentSection";
import { ProjectSection } from "../panels/ProjectSection";
import { PanelBoundary } from "./PanelBoundary";

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
      <PanelBoundary name="Screens"><ScreenList /></PanelBoundary>
      <PanelBoundary name="Transform"><TransformSection /></PanelBoundary>
      <PanelBoundary name="Size"><SizeSection /></PanelBoundary>
      <PanelBoundary name="Content"><ContentSection /></PanelBoundary>
      <PanelBoundary name="Model"><ModelInfo /></PanelBoundary>
      <PanelBoundary name="Walk settings"><WalkSettings /></PanelBoundary>
      <PanelBoundary name="Project"><ProjectSection /></PanelBoundary>
    </aside>
  );
}