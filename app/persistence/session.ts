import { debounce } from "@/app/lib/debounce";
import { isUnit } from "@/app/lib/units";
import { VIDEO_SRC_PREFIX, type SceneSetup, type Screen } from "@/app/lib/schema";
import {
  exportFileName,
  MAX_SETUP_CHARS,
  parseSetupText,
  serializeSetup,
  setupToJson,
  summarizeSetup,
  type SetupParseResult,
} from "@/app/lib/setupFile";
import { countMissingVideos, videoSrcsOf } from "@/app/lib/setupPlan";
import { downloadText } from "@/app/lib/download";
import { deleteBlob, getBlob, listBlobKeys, modelBlobKey, putBlob } from "@/app/lib/storage/blobStore";
import { STORAGE_MESSAGES } from "@/app/lib/storage/storageErrors";
import {
  clearLastSession,
  getLocalStorage,
  listSetupKeys,
  loadLastSession,
  loadSetup,
  removeSetup,
  saveLastSession,
  saveSetup,
  type IterableStorage,
} from "@/app/lib/storage/setupStorage";
import { usePersistenceStore } from "@/app/store/usePersistenceStore";
import { useSceneStore } from "@/app/store/useSceneStore";
import { useScreenStore } from "@/app/store/useScreenStore";
import { openModelFiles } from "@/app/three/loaders/openModelFiles";
import { getVideoFile, registerVideoSource } from "./../three/screens/Video/videoSources";
import { modelIdentity, type ModelIdentity } from "./modelIdentity";
import { wantsPresentation } from "@/app/lib/presentParam";
import { enterPresentation } from "@/app/presentation/presentationControl";

const SAVE_DELAY_MS = 300;
const MODEL_BLOB_PREFIX = modelBlobKey("");

/* ---------- module state (lives outside React) ---------- */

let storageCache: IterableStorage | null | undefined;
const ls = () => (storageCache === undefined ? (storageCache = getLocalStorage()) : storageCache);

/** The model key whose screens are currently in the screen store. Null while switching. */
let activeKey: string | null = null;
let applying = false; // true while we replace the screens ourselves: not a user edit
let loadToken = 0;
let loading: Promise<void> = Promise.resolve();
let restoreStarted = false;
const storedVideos = new Set<string>();
const storedModels = new Set<string>();

const pstore = () => usePersistenceStore.getState();
const paused = () => pstore().savingPaused;
const fail = (message: string) => pstore().markError(message);
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/* ---------- autosave ---------- */

type ModelInfo = { name: string; unit: string };

function save(key: string, screens: Screen[], model: ModelInfo): void {
  if (paused()) return;
  const result = saveSetup(ls(), key, serializeSetup(screens, model));
  if (result.ok) pstore().markSaved();
  else fail(result.message);
}

const autosave = debounce(save, SAVE_DELAY_MS);

function applyScreens(screens: Screen[]): void {
  applying = true;
  try {
    useScreenStore.getState().replaceAll(screens);
  } finally {
    applying = false;
  }
}

/* ---------- binaries (IndexedDB) ---------- */

/** Registers every video of these screens that is not in memory yet, from IndexedDB. */
async function restoreVideoSources(screens: readonly Screen[]): Promise<void> {
  for (const src of videoSrcsOf(screens)) {
    if (getVideoFile(src)) continue;
    const file = await getBlob(src);
    if (file) {
      registerVideoSource(src, file);
      storedVideos.add(src);
    }
  }
}

/** Saves any video file that is in memory but not in IndexedDB yet. */
function syncVideoBlobs(screens: readonly Screen[]): void {
  if (paused()) return;
  for (const src of videoSrcsOf(screens)) {
    if (storedVideos.has(src)) continue;
    const file = getVideoFile(src);
    if (!file) continue;
    storedVideos.add(src); // optimistic, so a burst of edits does not queue duplicates
    void putBlob(src, file).then((result) => {
      if (!result.ok) {
        storedVideos.delete(src);
        fail(result.message);
      }
    });
  }
}

async function persistModel(key: string, file: File): Promise<void> {
  const result = await putBlob(modelBlobKey(key), file);
  if (!result.ok) {
    fail(result.message);
    return;
  }
  // Only the latest model file is kept (setups of other models stay in localStorage).
  storedModels.clear();
  storedModels.add(key);
  for (const k of await listBlobKeys()) {
    if (k.startsWith(MODEL_BLOB_PREFIX) && k !== modelBlobKey(key)) await deleteBlob(k);
  }
}

/** Deletes video files that no saved setup and no open screen refers to. */
async function pruneBlobs(): Promise<void> {
  const storage = ls();
  const keep = new Set<string>(videoSrcsOf(useScreenStore.getState().screens));
  for (const key of listSetupKeys(storage)) {
    const stored = loadSetup(storage, key);
    if (stored.ok) for (const src of videoSrcsOf(stored.setup.screens)) keep.add(src);
  }
  for (const k of await listBlobKeys()) {
    if (k.startsWith(VIDEO_SRC_PREFIX) && !keep.has(k)) {
      await deleteBlob(k);
      storedVideos.delete(k);
    }
  }
}

/* ---------- switching models ---------- */

async function loadScreensFor(identity: ModelIdentity, token: number): Promise<void> {
  pstore().setRestoring(true);
  let screens: Screen[] = [];
  const stored = loadSetup(ls(), identity.key);
  if (stored.ok) screens = stored.setup.screens;
  else if (stored.reason === "invalid") {
    pstore().setNotice("The saved setup for this model was damaged and was ignored.");
  }

  await restoreVideoSources(screens); // before the screens exist, so ScreenVideo finds the files
  if (token !== loadToken) return; // a newer switch took over

  applyScreens(screens);
  activeKey = identity.key;
  pstore().setRestoring(false);
}

function switchModel(next: ModelIdentity | null, prev: ModelIdentity | null, file: File | undefined): void {
  autosave.flush(); // still holds the previous model's key and screens
  activeKey = null;
  const token = ++loadToken;
  applyScreens([]);

  if (!next) {
    pstore().setRestoring(false);
    clearLastSession(ls());
    if (prev) {
      storedModels.delete(prev.key);
      void deleteBlob(modelBlobKey(prev.key));
    }
    loading = Promise.resolve();
    return;
  }

  if (!paused()) {
    saveLastSession(ls(), { modelKey: next.key, name: next.name, unit: next.unit });
    if (file && !storedModels.has(next.key)) void persistModel(next.key, file);
  }
  loading = loadScreensFor(next, token);
}

function onModelChanged(model: ReturnType<typeof useSceneStore.getState>["model"], prevModel: typeof model): void {
  const next = modelIdentity(model);
  const prev = modelIdentity(prevModel);

  if (next?.key !== prev?.key) {
    switchModel(next, prev, model?.kind === "file" ? model.file : undefined);
    return;
  }
  if (next && prev && next.unit !== prev.unit && !paused()) {
    saveLastSession(ls(), { modelKey: next.key, name: next.name, unit: next.unit });
    if (activeKey) autosave(activeKey, useScreenStore.getState().screens, { name: next.name, unit: next.unit });
  }
}

/* ---------- startup ---------- */

async function restoreLastSession(): Promise<void> {
  const last = loadLastSession(ls());
  if (!last) return;

  pstore().setRestoring(true);
  try {
    if (last.modelKey === "sample") {
      if (useSceneStore.getState().model) return; // the user got there first
      useSceneStore.getState().loadSample();
    } else {
      const file = await getBlob(modelBlobKey(last.modelKey));
      if (useSceneStore.getState().model) return;
      if (!file) {
        clearLastSession(ls());
        pstore().setNotice("The previous model could not be restored. Open it again to bring back its screens.");
        return;
      }
      storedModels.add(last.modelKey); // already in IndexedDB: do not write it again
      const opened = await openModelFiles([file]);
      if (!opened) {
        storedModels.delete(last.modelKey);
        return; // openModelFiles already showed why
      }
      const model = useSceneStore.getState().model;
      if (model?.kind === "file" && last.unit && isUnit(last.unit) && last.unit !== model.unit) {
        useSceneStore.getState().setModelUnit(last.unit);
      }
    }
    await loading;
    pstore().setNotice("Restored previous session");
    void pruneBlobs();
  } catch (error) {
    console.error("[restoreLastSession]", error);
  } finally {
    // A switch that is still loading owns the flag.
    if (activeKey !== null || !useSceneStore.getState().model) pstore().setRestoring(false);
  }
}

/** Starts autosave and the one-time restore. Safe under Strict Mode. Returns the stop function. */
export function startPersistence(): () => void {
  if (!ls()) fail(STORAGE_MESSAGES.unavailable);

  const stopModel = useSceneStore.subscribe((s, p) => {
    if (s.model !== p.model) onModelChanged(s.model, p.model);
  });
  const stopScreens = useScreenStore.subscribe((s, p) => {
    if (s.screens === p.screens) return;
    syncVideoBlobs(s.screens);
    if (applying || activeKey === null) return;
    const id = modelIdentity(useSceneStore.getState().model);
    if (!id || id.key !== activeKey) return;
    autosave(activeKey, s.screens, { name: id.name, unit: id.unit });
  });

  const onHide = () => autosave.flush();
  const onVisibility = () => {
    if (document.visibilityState === "hidden") autosave.flush();
  };
  window.addEventListener("pagehide", onHide);
  document.addEventListener("visibilitychange", onVisibility);

  if (!restoreStarted) {
  restoreStarted = true;
  void restoreLastSession().then(() => {
    if (!wantsPresentation(window.location.search)) return;
    // No gesture, so no fullscreen: the bar offers it.
    if (!enterPresentation({ fullscreen: false })) {
      pstore().setNotice("Nothing to present yet: open a model first.");
    }
  });}

  return () => {
    stopModel();
    stopScreens();
    window.removeEventListener("pagehide", onHide);
    document.removeEventListener("visibilitychange", onVisibility);
    autosave.flush();
  };
}

/* ---------- export, import, reset ---------- */

export function exportSetup(): void {
  const id = modelIdentity(useSceneStore.getState().model);
  if (!id) return;
  const setup = serializeSetup(useScreenStore.getState().screens, { name: id.name, unit: id.unit });
  downloadText(exportFileName(id.name, new Date()), setupToJson(setup));
}

/** Reads and validates a setup file without applying it. */
export async function readSetupFile(file: File): Promise<SetupParseResult> {
  if (file.size > MAX_SETUP_CHARS) return { ok: false, message: "This file is too large to be a screen setup." };
  let text: string;
  try {
    text = await file.text();
  } catch {
    return { ok: false, message: "The file could not be read." };
  }
  return parseSetupText(text);
}

/** Replaces the screens with an imported setup. Returns false if the model changed meanwhile. */
export async function applyImportedSetup(setup: SceneSetup): Promise<boolean> {
  const key = activeKey;
  if (key === null) return false;

  await restoreVideoSources(setup.screens);
  if (activeKey !== key) return false;

  useScreenStore.getState().replaceAll(setup.screens); // not "applying": this should autosave
  const missing = countMissingVideos(setup.screens, (src) => getVideoFile(src) !== null);
  const summary = summarizeSetup(setup, 0);
  pstore().setNotice(
    missing > 0
      ? `Imported ${summary}. ${plural(missing, "screen has", "screens have")} no video file: select it and choose the file again.`
      : `Imported ${summary}.`,
  );
  return true;
}

/** Deletes the saved setup, the stored files and the open scene. The caller has already confirmed. */
export async function resetScene(): Promise<void> {
  autosave.cancel();
  const id = modelIdentity(useSceneStore.getState().model);
  if (id) removeSetup(ls(), id.key);
  useSceneStore.getState().clearModel(); // clears screens, last session and the stored model file
  await pruneBlobs();
  pstore().reset();
}