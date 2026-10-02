type PickOptions = { accept: string; multiple?: boolean };

/** Opens the native file dialog. Must be called from a user gesture (click). */
export function pickFiles(options: PickOptions, onPick: (files: File[]) => void): void {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = options.accept;
  input.multiple = options.multiple ?? false;
  input.style.display = "none";
  // Some browsers drop the change event if the input is garbage collected,
  // so keep it in the DOM until the dialog resolves.
  document.body.appendChild(input);

  const cleanup = () => input.remove();
  input.addEventListener("change", () => {
    const files = Array.from(input.files ?? []);
    cleanup();
    if (files.length > 0) onPick(files);
  }, { once: true });
  input.addEventListener("cancel", cleanup, { once: true });

  input.click();
}