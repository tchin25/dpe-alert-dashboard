import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import utc from "dayjs/plugin/utc";
dayjs.extend(customParseFormat);
dayjs.extend(utc);

import { Thread, ThreadParser } from "./thread-parser";

export default class NagiosParser extends ThreadParser {
  isParseable(thread: Thread): boolean {
    return thread.author.includes("nagios");
  }

  parse(thread: Thread): Thread {
    let parsedData: Partial<Thread> = {
      system: "nagios",
      severity: "low",
      tags: thread.tags,
    };

    const typeMatch = thread.details.match(/Notification Type:\s*(.*)/);
    const serviceMatch = thread.details.match(/Service:\s*(.*)/);
    const stateMatch = thread.details.match(/State:\s*(.*)/);
    const dateMatch = thread.details.match(/Date\/Time:\s*(.*)/);

    if (typeMatch) {
      parsedData.tags.push(typeMatch[1]);
    }
    if (serviceMatch) {
      parsedData.tags.push(serviceMatch[1]);
    }
    if (stateMatch) {
      parsedData.tags.push(stateMatch[1]);
    }
    if (dateMatch) {
      parsedData.estimatedPostDate = dayjs(dateMatch[1]).toISOString();
    }

    return {
      ...thread,
      ...parsedData,
    };
  }
}
