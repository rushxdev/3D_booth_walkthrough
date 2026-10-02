// 3.3 adds more codes (corrupt, empty-scene, missing-resources, out-of-memory).
export type LoadIssue = {
  severity: "error" | "warning";
  code: "unsupported-type" | "empty-file" | "large-file";
  title: string;
  message: string;
};