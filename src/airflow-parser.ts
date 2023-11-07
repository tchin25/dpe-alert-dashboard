import { Thread, ThreadParser } from "./thread-parser";

const AirflowAlertTypes = [
  "Anomaly",
  "SLA Miss",
  "Task Failed",
  "Unexpected Found",
  "Data Loss",
  "unknown",
] as const;

type AirflowAlertType = (typeof AirflowAlertTypes)[number];

export default class extends ThreadParser {
  isParseable(thread: Thread): boolean {
    return thread.author.includes("airflow-analytics");
  }

  parse(thread: Thread): Thread {
    let parsedData: Partial<Thread> = {
      system: "airflow",
      tags: thread.tags,
    };

    /**
     * Airflow alerts have .htm content instead of text,
     * which we do not currently parse.
     */
    let alert: AirflowAlertType = "unknown";
    for (const airflowAlertType of AirflowAlertTypes) {
      if (thread.title.includes(airflowAlertType)) {
        parsedData.tags.push(airflowAlertType);
        alert = airflowAlertType;
        break;
      }
    }

    if (thread.title.includes("Anomaly")) {
    } else if (thread.title.includes("SLA miss")) {
    } else if (thread.title.includes(""))
      switch (alert) {
        case "SLA Miss":
        case "Task Failed":
        case "Data Loss":
          parsedData.severity = "high";
          break;
        case "Unexpected Found":
          parsedData.severity = "medium";
          break;
        case "Anomaly":
        default:
          parsedData.severity = "low";
          break;
      }

    return {
      ...thread,
      ...parsedData,
    };
  }

  _extractDagName(str: string) {
    // This regular expression looks for a sequence of word characters (alphanumeric and underscores)
    // followed by a non-word character like a space, period, or bracket. It captures the word characters.
    const dagNamePattern = /(\b\w+)\b(?=[ .[\](){}])/g;

    let match;
    let dagNames = [];

    // Use RegExp.exec in a loop to find multiple matches in the input string
    while ((match = dagNamePattern.exec(str)) !== null) {
      // Avoid capturing known words that precede a DAG name in your context
      const nonDagKeywords = [
        "TaskInstance",
        "DAG",
        "scheduled",
        "SLA",
        "miss",
        "Anomaly",
        "report",
        "Unexpected",
        "found",
        "in",
        "hourly",
        "Data",
        "Loss",
        "ERROR",
        "Airflow",
        "Analytics",
      ];

      if (nonDagKeywords.indexOf(match[1]) === -1) {
        // The captured group is at index 1 of the match array
        dagNames.push(match[1]);
      }
    }

    return dagNames.length > 0 ? dagNames[0] : "";
  }
}
