/** True for ?present=1 or ?present=true. Never throws. */
export function wantsPresentation(search: string): boolean {
  try {
    const v = new URLSearchParams(search).get("present");
    return v === "1" || v?.toLowerCase() === "true";
  } catch {
    return false;
  }
}