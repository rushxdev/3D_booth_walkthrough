import { createStore, del, get, keys, set, type UseStore } from "idb-keyval";
import { classifyStorageError, STORAGE_MESSAGES, type StorageFailure } from "./storageErrors";

type Stored = { name: string; type: string; blob: Blob };

export type BlobPutResult = { ok: true } | { ok: false; reason: StorageFailure; message: string };

let store: UseStore | null = null;
const getStore = (): UseStore => (store ??= createStore("booth-viewer", "files"));

export const modelBlobKey = (modelKey: string) => `model:${modelKey}`;

export async function putBlob(key: string, file: File): Promise<BlobPutResult> {
  try {
    const value: Stored = { name: file.name, type: file.type, blob: file };
    await set(key, value, getStore());
    return { ok: true };
  } catch (error) {
    const reason = classifyStorageError(error);
    return { ok: false, reason, message: STORAGE_MESSAGES[reason] };
  }
}

/** Returns null when missing or unreadable. */
export async function getBlob(key: string): Promise<File | null> {
  try {
    const v = await get<Stored>(key, getStore());
    if (!v || !(v.blob instanceof Blob)) return null;
    return new File([v.blob], v.name, { type: v.type });
  } catch {
    return null;
  }
}

export async function deleteBlob(key: string): Promise<void> {
  try {
    await del(key, getStore());
  } catch {
    /* nothing to do */
  }
}

export async function listBlobKeys(): Promise<string[]> {
  try {
    return (await keys(getStore())).filter((k): k is string => typeof k === "string");
  } catch {
    return [];
  }
}