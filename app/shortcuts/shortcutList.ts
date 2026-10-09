export type ShortcutContext = { mode: "overview" | "walk"; presenting: boolean };
export type ShortcutItem = { keys: string[]; action: string };
export type ShortcutGroup = { title: string; items: ShortcutItem[] };

const item = (action: string, ...keys: string[]): ShortcutItem => ({ keys, action });

/** `?`, with no Ctrl, Cmd or Alt. Uses e.key so it works on layouts where ? needs another combination. */
export function isHelpKey(e: { key: string; ctrlKey: boolean; metaKey: boolean; altKey: boolean }): boolean {
  return e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey;
}

/** Only keys that actually work right now: Walk uses W and S for movement, presenting disables editing. */
export function shortcutGroups({ mode, presenting }: ShortcutContext): ShortcutGroup[] {
  const groups: ShortcutGroup[] = [];

  groups.push(
    presenting
      ? {
          title: "Presentation",
          items: [
            item("Exit presentation", "P"),
            item("Switch Overview and Walk", "V"),
            item("Show or hide this list", "?"),
          ],
        }
      : {
          title: "General",
          items: [item("Presentation mode", "P"), item("Show or hide this list", "?")],
        },
  );

  if (mode === "walk") {
    groups.push({
      title: "Walk",
      items: [
        item("Move", "W", "A", "S", "D"),
        item("Run", "Shift"),
        item("Look", "Mouse"),
        item("Reset position", "R"),
        item("Release the mouse", "Esc"),
      ],
    });
  } else {
    groups.push({
      title: "Overview",
      items: [
        item("Rotate", "Left drag"),
        item("Pan", "Right drag"),
        item("Zoom", "Wheel"),
        item("Frame model", "F"),
      ],
    });
    if (!presenting) {
      groups.push({
        title: "Editing",
        items: [
          item("Move tool", "W"),
          item("Rotate tool", "E"),
          item("Place on surface", "S"),
          item("Cancel placing", "Esc"),
          item("Delete screen", "Delete"),
          item("Duplicate screen", "Ctrl or Cmd", "D"),
          item("Rename (in the list)", "F2"),
        ],
      });
    }
  }

  if (!presenting) {
    groups.push({
      title: "Number fields",
      items: [
        item("Step the value", "Up", "Down"),
        item("Step by 10", "Shift", "Up", "Down"),
        item("Step by 0.1", "Alt", "Up", "Down"),
        item("Apply", "Enter"),
        item("Revert", "Esc"),
      ],
    });
  }

  return groups;
}