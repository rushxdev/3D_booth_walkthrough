"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Footprints, Maximize, Minimize, Orbit, Volume2, VolumeX, X } from "lucide-react";
import { IconButton } from "@/app/components/ui/IconButton";
import { SegmentedControl } from "@/app/components/ui/SegmentedControls";
import { cn } from "@/app/lib/cn";
import { enterFullscreen, exitFullscreen, fullscreenSupported } from "@/app/lib/fullscreen";
import { exitPresentation } from "@/app/presentation/presentationControl";
import { usePresenting } from "@/app/presentation/usePresenting";
import { useVideoStore } from "@/app/store/useVideoStore";
import { isViewMode, useUiStore } from "@/app/store/useUiStore";
import { setAllMuted } from "@/app/three/screens/Video/videoControls";

const HIDE_AFTER_MS = 2500;

export function PresentationBar() {
  const presenting = usePresenting();
  const mode = useUiStore((s) => s.mode);
  const setMode = useUiStore((s) => s.setMode);
  const walkLocked = useUiStore((s) => s.walkLocked);
  const anyVideo = useVideoStore((s) => Object.values(s.byScreen).some((v) => v.phase === "ready"));
  const anySound = useVideoStore((s) => Object.values(s.byScreen).some((v) => v.phase === "ready" && !v.muted));

  const subscribeFullscreen = (cb: () => void) => {
    document.addEventListener("fullscreenchange", cb);
    return () => document.removeEventListener("fullscreenchange", cb);
  };

  const noSubscribe = () => () => {};
  const [awake, setAwake] = useState(true);
  const fs = useSyncExternalStore(
    subscribeFullscreen,
    () => !!document.fullscreenElement,
    () => false
  );
  const fsOk = useSyncExternalStore(
    noSubscribe,
    () => fullscreenSupported(),
    () => false
  );

  // Fade in on pointer movement, out after a pause.
  useEffect(() => {
    if (!presenting) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const wake = () => {
      setAwake(true);
      clearTimeout(timer);
      timer = setTimeout(() => setAwake(false), HIDE_AFTER_MS);
    };
    wake(); // also runs when the lock is released, so Esc reveals the bar
    document.addEventListener("pointermove", wake);
    document.addEventListener("pointerdown", wake);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("pointermove", wake);
      document.removeEventListener("pointerdown", wake);
    };
  }, [presenting, walkLocked]);

  if (!presenting) return null;
  const visible = awake && !walkLocked; // mouse-look would keep waking it

  return (
    <div
      className={cn(
        "fixed right-3 top-3 z-20 flex items-center gap-1 rounded-sm border border-line bg-surface-1 p-1 transition-opacity duration-150",
        visible ? "opacity-100" : "pointer-events-none opacity-0 focus-within:pointer-events-auto focus-within:opacity-100",
      )}
    >
      <SegmentedControl
        aria-label="Camera mode"
        iconOnly
        value={mode}
        onValueChange={(v) => isViewMode(v) && setMode(v)}
        options={[
          { value: "overview", label: "Overview", icon: Orbit, shortcut: "V" },
          { value: "walk", label: "Walk", icon: Footprints, shortcut: "V" },
        ]}
      />
      {anyVideo && (
        <IconButton
          icon={anySound ? Volume2 : VolumeX}
          label={anySound ? "Mute videos" : "Unmute videos"}
          onClick={() => setAllMuted(anySound)}
        />
      )}
      {fsOk && (
        <IconButton
          icon={fs ? Minimize : Maximize}
          label={fs ? "Exit fullscreen" : "Fullscreen"}
          onClick={() => void (fs ? exitFullscreen() : enterFullscreen())}
        />
      )}
      <IconButton icon={X} label="Exit presentation" shortcut="P" onClick={exitPresentation} />
    </div>
  );
}