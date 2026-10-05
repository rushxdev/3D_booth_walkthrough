export const SNAP_TRANSLATION = 0.05;              // m
export const SNAP_ROTATION = (5 * Math.PI) / 180;  // 5 degrees

/** The live gizmo, so the picker can tell a click on a handle from a click on empty space. */
export const gizmo: { controls: { axis: string | null } | null } = { controls: null };