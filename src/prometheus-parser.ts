import { Thread, ThreadParser } from "./thread-parser";

export default class PrometheusParser extends ThreadParser {
  isParseable(thread: Thread): boolean {
    return thread.author.includes("sre-observability");
  }
  parse(thread: Thread): Thread {
    /**
     * Prometheus alerts have an .htm file as its contents instead of text,
     * which we do not currently parse.
     */
    let parsedData: Partial<Thread> = {
      system: "prometheus",
      tags: thread.tags,
      severity: "high",
    };

    // Title has shape like:
    // [FIRING:1] EventgateValidationErrors data-engineering (k8s eventgate-analytics-external critical eqiad prometheus eventlogging_WMDEBannerSizeIssue)
    // Where the content shape is indeterminate except for the error
    const [, error] = thread.title.split(" ");
    parsedData.tags.push(error);

    return {
      ...thread,
      ...parsedData,
    };
  }
}
