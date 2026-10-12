# 3D Booth Walkthrough Viewer

A browser tool for design reviews of event booths and stages. Load a 3D model, look around it from outside, walk through it in first person, add real-size screens, play video on them, save the setup, and present it to a client.

- Live demo: https://3-d-booth-walkthrough.vercel.app/
- Demo recording: https://drive.google.com/file/d/18NPuJLrY6Vh6k_7-4OBi83glAb9uN5OC/view?usp=sharing
## Features

**Viewing**
- Open a `.glb` or `.gltf` file by dialog or drag and drop. Wrong, empty, corrupt and oversized files give a message that says what to do.
- Models are scaled to meters (units are guessed and can be corrected), centered, stood on a floor and lit.
- **Overview mode:** orbit, pan, zoom, and frame the model (`F`).
- **Walk mode:** first person with mouse look and WASD. Walls are solid, low steps and stairs can be climbed, and you fall off ledges.
- Model info panel: name, file size, real-world dimensions, triangles, meshes, units.
- A built-in procedural sample booth, so the tool works without a file.

**Screens**
- Add rectangular screens, place them on a wall or surface in two clicks, move and rotate them with a gizmo or by typing exact values.
- Sizes are real-world meters. Presets for 16:9, 21:9, 1:1, 9:16 and 4:3, an aspect-ratio lock, a diagonal read-out in inches, and an informational resolution with pixel density and pitch.
- Play a video on a screen, fitted either to show all of it (**Contain**) or to fill the screen (**Cover**). Play, pause, mute, and play all or pause all.
- Autosave per model, export and import of the setup as JSON, and a reset.
- **Presentation mode:** hides every editing tool. See below.

Not built: live web pages on screens.
## Requirements

- Node.js [22 or newer]
- npm
- A current desktop browser (Chrome, Edge, Firefox, Safari) with WebGL 2. Mobile is not supported.

## Run it

```bash
npm install     # also copies the Draco and Basis decoders into public/ (postinstall)
npm run dev     # http://localhost:3000
```

Other scripts:

```bash
npm run build         # production build
npm run start         # serve the production build
npm run test          # unit tests (Vitest)
npm run lint          # ESLint
npm run audit:style   # checks the code for shadows, gradients, blur, emoji and off-palette colors
```

Deploying: the `postinstall` script must run on the host, otherwise Draco and KTX2 models fail to decode. Vercel runs it by default.

## Controls

| Where | Key | Action |
|---|---|---|
| Overview | Left drag, right drag, wheel | Rotate, pan, zoom |
| Overview | `F` | Frame the model |
| Overview | `W` / `E` | Move / rotate tool |
| Overview | `S` | Place the selected screen on a surface, then click a surface |
| Overview | `Esc` | Cancel placing |
| Walk | Click, then `W A S D` or arrows | Enter and move |
| Walk | `Shift` | Run |
| Walk | `R` | Reset position |
| Walk | `Esc` | Release the mouse |
| Anywhere | `P` | Presentation mode on and off |
| Anywhere | `?` | List the shortcuts that work right now |
| Editing | `Delete` | Delete the selected screen |
| Editing | `Ctrl` or `Cmd` + `D` | Duplicate the selected screen |
| Screen list | `F2`, double-click | Rename |
| Screen list | Up and Down | Move through screens |
| Number fields | Up and Down (`Shift` x10, `Alt` x0.1) | Step the value |
| Number fields | `Enter` / `Esc` | Apply / revert |

`W` and `S` are movement keys in Walk, so the editing keys only work in Overview.

### Presentation mode

Press `P` (or the Presentation button) to hide every editing tool and show only the 3D view. Screens stop being selectable, and the gizmo, grid, outlines, hints, toolbar and panel disappear. The editing keys do nothing.

- `P` exits. `V` switches Overview and Walk. `F` re-frames, and `R` resets the walk position.
- A small bar at the top right appears when the mouse moves: view switch, sound, fullscreen, exit.
- Videos start muted (browser autoplay policy). Use the sound button.
- Opening the app with `?present=1` enters presentation once the saved session is restored. Browsers don't allow fullscreen without a click, so use the bar's button.
- Exiting returns to the camera you had before presenting.

Presentation hides tools. It is not access control.

## Tech stack and why

| Choice | Why |
|---|---|
| Next.js (App Router), TypeScript strict | Required framework. The 3D canvas is client-only, so it is loaded with `ssr: false`. |
| three.js through React Three Fiber and drei | Declarative scene that fits React state. Per-frame logic stays outside React. |
| three-mesh-bvh | Fast raycasts and capsule queries for collision and surface placement on large models. |
| Zustand | Small stores that can also be read outside React, which per-frame code needs. |
| Tailwind CSS, Radix UI, lucide-react | Unstyled accessible primitives styled to the brief, with one icon set. |
| IndexedDB (`idb-keyval`) and localStorage | No server is needed. See "Saved data". |
| Vitest | Fast tests of pure logic. Logic is kept out of components, which have no tests. |

Conventions: all internal units are meters, and conversion happens only at the edges (model import and UI display). Per-frame code never lives in React state.

## Project structure

```
app/
  components/   ui (primitives), layout (shell, toolbar, overlays), panels (settings sections)
  lib/          schema, setup file validation, storage, units, math helpers
  persistence/  autosave, restore, export, import, reset
  presentation/ presentation mode and camera resume
  runtime/      error recovery and per-frame fault guard
  shortcuts/    shortcut list for the help panel
  store/        Zustand stores
  three/
    scene/      canvas, lighting, floor, sample booth
    loaders/    validation, reading, parsing, normalizing, disposal
    controls/   Overview and Walk controllers
    collision/  collider, capsule mover, spawn
    screens/    screen meshes, picking, placement, gizmo, video
scripts/        decoder copy (postinstall) and the style audit
```

## Supported formats

glTF 2.0: `.glb` and single-file `.gltf`, including Draco, Meshopt and KTX2 compression. The format is decided by the file's content, not its extension. A `.gltf` that needs external `.bin` or texture files is refused with a message to export a single `.glb`.

Other formats (FBX, OBJ, SketchUp, 3ds Max, Rhino and so on) are not opened directly. Convert them to glTF first, for example with Blender (File, Export, glTF 2.0).

Size limits: files over 150 MB give a warning, files over 512 MB are refused before being read, and `.gltf` text files over 200 MB are refused (use `.glb`). These limits are chosen values, not measurements.

## Saved data

| What | Where | Notes |
|---|---|---|
| Screens (the setup JSON) | `localStorage`, one entry per model | Autosaved 300 ms after a change, and on page hide |
| The last model file | IndexedDB | Only the most recent model file is kept |
| Video files | IndexedDB | Keyed by the `video:<id>` stored in the setup |
| Last session record | `localStorage` | Which model to restore and its unit override |
| Playback state, selection, camera, walk settings | Nowhere | Reset on reload |

A model's key is a hash of its file name and size. Two different files with the same name and size share a setup.

**Limits of this choice**
- `localStorage` holds about 5 MB of text. IndexedDB is larger, but the browser manages it.
- Everything is per browser profile and per origin. Nothing syncs between machines or browsers.
- Clearing site data deletes everything. Safari can evict site data after a period without a visit. Private browsing may refuse storage.
- If storage is full or blocked, a notice appears with **Export setup** and **Continue without saving**. The session keeps working.
- Setup files hold screens only. The model and the videos are not embedded: after importing on another machine, reopen the model and relink the videos (screens show "Content missing").
- Setup files have a version number. A file from a newer version is refused with a message.




## Known limitations

**Walk and collision**
- Headroom isn't enforced: ceilings lower than 1.7 m can be walked through.
- Ground is checked at the capsule's center, so you can hang a radius over a ledge.
- Skinned and instanced meshes aren't collidable.
- Surfaces steeper than 50 degrees are never stood on.
- A model with every face inverted spawns the player outside it (still walkable).
- The collider build and the model parse run on the main thread, so very heavy models can stall the tab briefly.

**Screens and video**
- Gimbal lock at pitch +-90 degrees affects screens placed on floors and ceilings. Wall screens are fine.
- Hiding a screen unloads its video. Showing it restarts playback.
- Two screens using the same file decode it twice.
- Screens wider than 8:1 distort the name label slightly.
- Videos start muted because of browser autoplay policy.
- Only MP4 (H.264) and WebM are accepted. Other video formats get a message to re-export.
- Performance with many screens and videos was only spot-checked.

**App**
- Overview orbit, pan and zoom have no keyboard control. Everything else is reachable by keyboard.
- Input and panel borders are low contrast on purpose (thin and flat, per the brief). Focus rings and text pass WCAG contrast, and the design-token contrast is tested.
- The 3D canvas is not described to screen readers.
- Error boundaries catch rendering errors, and per-frame errors are caught in the viewport's own controllers. Code outside those, and the internals of third-party components, are not covered.
- Walk speed, look sensitivity, snap and gizmo choices are not saved.
- Fullscreen needs a browser with the standard Fullscreen API.

## What's next

- Live web pages on screens with a clear "can't be shown" message.
- Move the collider build and the glTF parse to a worker.
- Share one video element between screens that use the same file, and pause videos that are off-screen.
- Keyboard control for the Overview camera.
- FBX and OBJ import behind the same loader interface.