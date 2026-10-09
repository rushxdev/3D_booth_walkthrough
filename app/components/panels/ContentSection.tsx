"use client";

import { useState } from "react";
import { Ban, Crop, FolderOpen, Pause, Play, Shrink, Trash2, Video, Volume2, VolumeX } from "lucide-react";
import { IconButton } from "./../../components/ui/IconButton";
import { Row } from "./../../components/ui/Row";
import { Section } from "./../../components/ui/Section";
import { SegmentedControl } from "./../../components/ui/SegmentedControls";
import { Value } from "./../../components/ui/Value";
import { pickFiles } from "@/app/lib/pickFiles";
import { formatBytes } from "@/app/lib/format";
import { checkVideoFile } from "@/app/lib/videoFile";
import type { Screen } from "@/app/lib/schema";
import { useScreenStore } from "@/app/store/useScreenStore";
import { useVideoStore } from "@/app/store/useVideoStore";
import { addVideoSource, getVideoFile } from "@/app/three/screens/Video/videoSources";
import { toggleMute, togglePlay } from "@/app/three/screens/Video/videoControls";

const VIDEO_ACCEPT = "video/mp4,video/webm,.mp4,.m4v,.webm";

type Notice = { kind: "error" | "warning"; text: string };

export function ContentSection() {
  const screen = useScreenStore((s) => s.screens.find((x) => x.id === s.selectedId));
  if (!screen) return null;
  // Keyed so notices and local state never leak between screens.
  return <ContentBody key={screen.id} screen={screen} />;
}

function ContentBody({ screen }: { screen: Screen }) {
  const update = useScreenStore((s) => s.update);
  const status = useVideoStore((s) => s.byScreen[screen.id]);
  const [notice, setNotice] = useState<Notice | null>(null);

  const { type, src, fit } = screen.content;
  const locked = screen.locked;
  const file = type === "video" ? getVideoFile(src) : null;
  const ready = status?.phase === "ready";
  const playing = !!status?.playing;
  const muted = status?.muted ?? true;

  const setType = (next: "none" | "video") => {
    setNotice(null);
    if (next === "none") update(screen.id, { content: { type: "none", fit } });
    else update(screen.id, { content: src ? { type: "video", src, fit } : { type: "video", fit } });
  };

  const chooseFile = () =>
    pickFiles({ accept: VIDEO_ACCEPT }, ([picked]) => {
      const check = checkVideoFile(picked);
      if (!check.ok) {
        setNotice({ kind: "error", text: check.message });
        return;
      }
      setNotice(check.warning ? { kind: "warning", text: check.warning } : null);
      update(screen.id, { content: { type: "video", src: addVideoSource(picked), fit } });
    });

  const remove = () => {
    setNotice(null);
    update(screen.id, { content: { type: "none", fit } });
  };

  const message = notice?.text ?? (status?.phase === "error" ? status.message : null);
  const isError = notice ? notice.kind === "error" : status?.phase === "error";

  return (
    <Section title="Content">
      <Row label="Type">
        <SegmentedControl
          aria-label="Content type"
          disabled={locked}
          value={type}
          onValueChange={(v) => (v === "none" || v === "video") && setType(v)}
          options={[
            { value: "none", label: "None", icon: Ban },
            { value: "video", label: "Video", icon: Video },
          ]}
        />
      </Row>

      {type === "video" && (
        <>
          <Row label="File">
            <div className="flex min-w-0 items-center justify-end gap-1">
              <Value>{file ? `${file.name} (${formatBytes(file.size)})` : src ? "Content missing" : "No file"}</Value>
              <IconButton icon={FolderOpen} label={!src ? "Choose video" : file ? "Replace video" : "Relink video"} onClick={chooseFile} disabled={locked} />
              {src && <IconButton icon={Trash2} label="Remove video" onClick={remove} disabled={locked} />}
            </div>
          </Row>

          <Row label="Fit">
            <SegmentedControl
              aria-label="Video fit"
              disabled={locked}
              value={fit}
              onValueChange={(v) =>
                (v === "contain" || v === "cover") &&
                update(screen.id, { content: { ...screen.content, fit: v } })
              }
              options={[
                { value: "contain", label: "Contain", icon: Shrink },
                { value: "cover", label: "Cover", icon: Crop },
              ]}
            />
          </Row>

          <Row label="Playback">
            <div className="flex items-center justify-end gap-1">
              <IconButton
                icon={playing ? Pause : Play}
                label={playing ? "Pause" : "Play"}
                onClick={() => togglePlay(screen.id)}
                disabled={!ready}
              />
              <IconButton
                icon={muted ? VolumeX : Volume2}
                label={muted ? "Unmute" : "Mute"}
                onClick={() => toggleMute(screen.id)}
                disabled={!ready}
              />
            </div>
          </Row>

          {status?.aspect && (
            <Row label="Video aspect">
              <Value>{status.aspect.toFixed(3)} : 1</Value>
            </Row>
          )}

          {src && !ready && !message && (
            <p className="px-3 py-1 text-xs text-fg-secondary">Loading video…</p>
          )}
        </>
      )}

      {message && (
        <p role="alert" className={`px-3 py-1 text-xs ${isError ? "text-danger-text" : "text-fg-secondary"}`}>
          {message}
        </p>
      )}
    </Section>
  );
}