import { Thread, ThreadParser } from "./thread-parser";

export default class SystemdtimerParser extends ThreadParser {
  isParseable(thread: Thread): boolean {
    return thread.author.includes("SYSTEMDTIMER");
  }

  parse(thread: Thread): Thread {
    let parsedData: Partial<Thread> = {
      system: "systemd",
      severity: "low",
      tags: thread.tags,
    };

    const data = this._extractInfo(thread.details);

    if (data.time) {
      parsedData.estimatedPostDate = data.time;
    }
    if (data.process) {
      parsedData.tags.push(data.process);
    }

    return {
      ...thread,
      ...parsedData,
    };
  }

  _extractInfo(logString: string): {
    process?: string;
    time?: string;
  } {
    // produce_canary_events is not running
    const notRunningRegex = /(\w+) is not running/;

    // 2023-11-07T04:30:07.579
    const timeRegex = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3})/;

    const notRunningMatch = logString.match(notRunningRegex);
    const timeMatch = logString.match(timeRegex);

    return {
      process: notRunningMatch ? notRunningMatch[1] : null,
      time: timeMatch ? timeMatch[1] : null,
    };
  }
}
