"use client";

import { useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { Button } from "./../../components/ui/Button";
import { IconButton } from "./../../components/ui/IconButton";
import { Row } from "./../../components/ui/Row";
import { Section } from "./../../components/ui/Section";
import { Value } from "./../../components/ui/Value";
import { pickFiles } from "@/app/lib/pickFiles";
import type { SceneSetup } from "@/app/lib/schema";
import { describeImport } from "@/app/lib/setupPlan";
import { usePersistenceStore } from "@/app/store/usePersistenceStore";
import { useSceneStore } from "@/app/store/useSceneStore";
import { useScreenStore } from "@/app/store/useScreenStore";
import { modelIdentity } from "@/app/persistence/modelIdentity";
import { applyImportedSetup, exportSetup, readSetupFile, resetScene } from "@/app/persistence/session";

type Pending = { kind: "import"; setup: SceneSetup; skipped: number } | { kind: "reset" };

export function ProjectSection() {
  const model = useSceneStore((s) => s.model);
  const screenCount = useScreenStore((s) => s.screens.length);
  const saveState = usePersistenceStore((s) => s.saveState);
  const paused = usePersistenceStore((s) => s.savingPaused);
  const restoring = usePersistenceStore((s) => s.restoring);
  const resumeSaving = usePersistenceStore((s) => s.resumeSaving);

  const [pending, setPending] = useState<Pending | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const hasModel = model !== null;
  const disabled = !hasModel || restoring;
  const autosave = paused ? "Off" : saveState === "saved" ? "Saved" : saveState === "error" ? "Failing" : "On";

  const startImport = () =>
    pickFiles({ accept: ".json,application/json" }, async ([file]) => {
      const result = await readSetupFile(file);
      if (!result.ok) {
        setPending(null);
        setImportError(result.message);
        return;
      }
      setImportError(null);
      setPending({ kind: "import", setup: result.setup, skipped: result.skipped });
    });

  const confirm = async () => {
    const p = pending;
    setPending(null);
    if (!p) return;
    if (p.kind === "import") await applyImportedSetup(p.setup);
    else await resetScene();
  };

  const plan =
    pending?.kind === "import"
      ? describeImport({
          setup: pending.setup,
          skipped: pending.skipped,
          currentScreenCount: screenCount,
          currentModelName: modelIdentity(model)?.name ?? null,
        })
      : null;

  return (
    <Section title="Project">
      <Row label="Autosave">
        <div className="flex items-center justify-end gap-2">
          <Value>{autosave}</Value>
          {paused && <Button onClick={resumeSaving}>Turn on</Button>}
        </div>
      </Row>

      <Row label="Setup file">
        <div className="flex items-center justify-end gap-1">
          <IconButton icon={Download} label="Export setup" onClick={exportSetup} disabled={disabled} />
          <IconButton
            icon={Upload}
            label={hasModel ? "Import setup" : "Open a model before importing"}
            onClick={startImport}
            disabled={disabled}
          />
        </div>
      </Row>

      <Row label="Scene">
        <div className="flex items-center justify-end">
          <IconButton
            icon={Trash2}
            label="Reset scene"
            onClick={() => setPending({ kind: "reset" })}
            disabled={disabled}
          />
        </div>
      </Row>

      {importError && (
        <p role="alert" className="text-xs text-danger-text">
          {importError}
        </p>
      )}

      {pending && (
        <div className="space-y-2 border border-line p-2 text-xs">
          {plan ? (
            <>
              <p>{plan.replaces}</p>
              {plan.modelNote && <p className="text-fg-secondary">{plan.modelNote}</p>}
            </>
          ) : (
            <p>
              Reset the scene? This deletes {screenCount} {screenCount === 1 ? "screen" : "screens"}, the saved setup and
              the stored files for this model, then closes it.
            </p>
          )}
          <div className="flex justify-end gap-1">
            <Button onClick={() => setPending(null)}>Cancel</Button>
            <Button variant="primary" onClick={confirm}>
              {pending.kind === "import" ? "Replace" : "Reset"}
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-fg-secondary">
        Setup files hold screens only. The model and video files are not embedded: reopen or relink them after importing.
      </p>
    </Section>
  );
}