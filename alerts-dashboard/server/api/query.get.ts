// Placeholder for data we'd fetch from a DB
// Note: Unsorted
import archiveData from "./data.json";

export interface Thread {
  title: string;
  threadId: string;
  lastReplyDate: string;
  author: string;
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
