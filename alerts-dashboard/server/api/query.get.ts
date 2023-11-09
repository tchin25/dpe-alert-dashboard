// Placeholder for data we'd fetch from a DB
// Note: Unsorted
import archiveData from "./data.json";
import { Thread } from "../../../src/thread-parser";

// Re-export types
export { Thread } from "../../../src/thread-parser";

let { data } = archiveData as { data: Thread[] };
data = data.sort(
  (a, b) =>
    new Date(b.estimatedPostDate).getTime() - new Date(a.estimatedPostDate).getTime()
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
      const date = new Date(item.estimatedPostDate);
      return date >= startDate && date <= endDate;
    }),
  };
});
