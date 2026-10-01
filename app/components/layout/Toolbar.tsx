"use client";

import { useState } from "react";
import { FolderOpen, Box, Move3d } from "lucide-react";
import { IconButton } from "./../ui/IconButton";
import { Button } from "./../ui/Button";

export function Toolbar() {
  const [on, setOn] = useState(false);
  return (
    <header className="flex h-(--toolbar-h) shrink-0 items-center gap-1 border-b border-line bg-surface-1 px-3">
      <span className="mr-2 text-sm font-medium text-fg">Booth Viewer</span>
      <IconButton icon={FolderOpen} label="Open model" shortcut="Ctrl O" />
      <IconButton icon={Box} label="Load sample" />
      <IconButton icon={Move3d} label="Move tool" active={on} onClick={() => setOn(!on)} />
      <IconButton icon={Box} label="Disabled example" disabled />
      <div className="flex-1" />
      <Button>Default</Button>
      <Button variant="primary">Primary</Button>
      <Button disabled>Disabled</Button>
    </header>
  );
}