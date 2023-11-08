export const Systems = ["nagios", "airflow", "systemd", "prometheus"] as const;

export type System = (typeof Systems)[number];

export type Severity = "high" | "medium" | "low";

export interface Thread {
  title: string;
  threadId: string;
  details?: string; // May not be the full content of the email
  estimatedPostDate: string; // Defaults to lastReplyDate
  lastReplyDate: string; // Last reply date as of when the web scrape happens
  author: string;
  system?: System;
  severity?: Severity;
  tags: string[]
}

export abstract class ThreadParser {
  abstract isParseable(thread: Thread): boolean;
  abstract parse(thread: Thread): Thread;
}
