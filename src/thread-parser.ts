export const Systems = ["nagios", "airflow", "systemd", "prometheus"] as const;

export type System = (typeof Systems)[number];

export type Severity = "high" | "medium" | "low";

export interface Thread {
  title: string;
  threadId: string;
  details?: string; // May not be the full content of the email
  /**
   * Defaults to lastReplyDate.
   * Be care of timezones when writing parsers.
   */
  estimatedPostDate: string;
  /**
   * Last post date in the thread when the web scrape happened.
   * TODO: see what timezone this is in
   */
  lastReplyDate: string;
  author: string;
  system?: System;
  severity?: Severity;
  tags: string[]
}

export abstract class ThreadParser {
  abstract isParseable(thread: Thread): boolean;
  abstract parse(thread: Thread): Thread;
}
