// Placeholder for data we'd fetch from a DB
// Note: Unsorted
import archiveData from "./data.json";

//TODO: Figure out how to include these types from the web scraper
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

let { data } = archiveData as { data: Thread[] };
data = data.sort(
  (a, b) =>
    new Date(b.lastReplyDate).getTime() - new Date(a.lastReplyDate).getTime()
);

export default defineEventHandler((event): { results: Thread[] } => {
  const query = getQuery<{ start_time: string; end_time: string }>(event);
  console.log("New request: " + getRequestURL(event));
  const { start_time, end_time } = query;
  if (!start_time && !end_time) {
    return { results: data };
  }

  const startDate = start_time ? new Date(start_time) : new Date(0);
  const endDate = end_time ? new Date(end_time) : new Date();

  return {
    results: data.filter((item) => {
      const date = new Date(item.lastReplyDate);
      return date >= startDate && date <= endDate;
    }),
  };
});
