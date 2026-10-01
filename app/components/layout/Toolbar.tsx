export function Toolbar() {
  return (
    <header className="flex h-(--toolbar-h) shrink-0 items-center gap-2 border-b border-line bg-surface-1 px-3">
      <span className="text-sm font-medium text-fg">Booth Viewer</span>
      <div className="flex-1" />
    </header>
  );
}