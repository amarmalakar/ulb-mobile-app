export type ContactMethod = "phone" | "email";

export type Contact =
  | { kind: "phone"; value: string }
  | { kind: "email"; value: string };
