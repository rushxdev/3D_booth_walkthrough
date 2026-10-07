export type StorageFailure = "quota" | "unavailable" | "unknown";

export const STORAGE_MESSAGES: Record<StorageFailure, string> = {
  quota: "Browser storage is full, so your changes are not being saved. Export your setup to keep them.",
  unavailable:
    "Browser storage is unavailable (private browsing or blocked by settings). Changes are lost when you close this tab. You can still export your setup.",
  unknown: "Saving failed. Your changes may be lost when you close this tab. Export your setup to keep them.",
};

/** Works on DOMException and on look-alikes, since browsers differ in names and codes. */
export function classifyStorageError(error: unknown): StorageFailure {
  const e = error as { name?: unknown; code?: unknown } | null;
  const name = typeof e?.name === "string" ? e.name : "";
  const code = typeof e?.code === "number" ? e.code : -1;
  if (name === "QuotaExceededError" || name === "NS_ERROR_DOM_QUOTA_REACHED" || code === 22 || code === 1014) {
    return "quota";
  }
  if (name === "SecurityError" || name === "InvalidStateError" || name === "NotAllowedError") {
    return "unavailable";
  }
  return "unknown";
}