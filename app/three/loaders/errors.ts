export type LoadIssueCode =
  | "unsupported-type"
  | "empty-file"
  | "large-file"
  | "not-gltf"
  | "unsupported-version"
  | "missing-resources"
  | "empty-scene"
  | "out-of-memory"
  | "read-failed"
  | "corrupt-file"
  | "too-large"
  | "cancelled"
  | "unexpected";

export type LoadIssue = {
  severity: "error" | "warning";
  code: LoadIssueCode;
  title: string;
  message: string;
};

export function errorIssue(code: LoadIssueCode, title: string, message: string): LoadIssue {
  return { severity: "error", code, title, message };
}