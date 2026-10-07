import { formatBytes } from "./format";

export const LARGE_VIDEO_BYTES = 300 * 1024 * 1024;

const ACCEPTED_EXT = [".mp4", ".m4v", ".webm"];
const ACCEPTED_MIME = ["video/mp4", "video/webm"];
const OTHER_VIDEO_EXT = [".mov", ".avi", ".mkv", ".wmv", ".flv", ".mpg", ".mpeg"];

export type VideoFileInfo = { name: string; size: number; type: string };

export type VideoFileCheck =
  | { ok: true; warning: string | null }
  | { ok: false; message: string };

const extensionOf = (name: string) => {
  const i = name.lastIndexOf(".");
  return i < 0 ? "" : name.slice(i).toLowerCase();
};

export function checkVideoFile(file: VideoFileInfo): VideoFileCheck {
  if (file.size === 0) {
    return { ok: false, message: "This file is empty." };
  }

  const ext = extensionOf(file.name);
  const type = file.type.toLowerCase();
  const accepted = ACCEPTED_EXT.includes(ext) || ACCEPTED_MIME.includes(type);

  if (!accepted) {
    const looksLikeVideo = type.startsWith("video/") || OTHER_VIDEO_EXT.includes(ext);
    return {
      ok: false,
      message: looksLikeVideo
        ? "Browsers don't reliably play this video format. Re-export it as MP4 (H.264) or WebM."
        : "This isn't a video file. Choose an MP4 (H.264) or WebM file.",
    };
  }

  if (file.size > LARGE_VIDEO_BYTES) {
    return {
      ok: true,
      warning: `This video is ${formatBytes(file.size)}. Large files can play poorly and may not fit in browser storage.`,
    };
  }
  return { ok: true, warning: null };
}

/** Maps HTMLMediaElement error codes (MediaError.code) to a message that says what to do. */
export function describeMediaError(code: number | undefined): string {
  switch (code) {
    case 1:
      return "Loading the video was interrupted.";
    case 2:
      return "The video could not be read. Check that the file is still available.";
    case 3:
      return "The video could not be decoded. The file may be corrupt.";
    case 4:
      return "This browser can't play this video. Re-export it as MP4 with H.264 video and AAC audio.";
    default:
      return "The video failed to load.";
  }
}

export const NO_PICTURE_MESSAGE = "This file has no picture track (audio only).";