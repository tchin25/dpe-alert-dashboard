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

export default class AirflowParser extends ThreadParser {
  isParseable(thread: Thread): boolean {
    return thread.author.includes("airflow-analytics");
  }

  parse(thread: Thread): Thread {
    let parsedData: Partial<Thread> = {
      system: "airflow",
      tags: thread.tags,
    };

    /**
     * Airflow alerts have an .htm file as its contents instead of text,
     * which we do not currently parse.
     */
    let alert: AirflowAlertType = this._getAirflowAlertType(thread.title);
    parsedData.tags.push(alert);

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

    const dag = this._extractDagName(thread.title);
    if (dag) {
      parsedData.tags.push(dag);
    }

    return {
      ...thread,
      ...parsedData,
    };
  }

  _getAirflowAlertType(str: string): AirflowAlertType {
    if (str.includes("[failed]")) {
      return "Task Failed";
    }
    if (str.includes("Anomaly report")) {
      return "Anomaly";
    }
    if (str.includes("Unexpected found")) {
      return "Unexpected Found";
    }
    if (str.includes("SLA miss")) {
      return "SLA Miss";
    }
    if (str.includes("Data Loss ERROR")) {
      return "Data Loss";
    }

    return "unknown";
  }

  _extractDagName(str: string): string | null {
    // This regular expression looks for a word that may optionally be
    // preceded by 'DAG=' and followed by a space, period, end of line, or bracket.
    const dagNamePattern = /(?:DAG=)?(\b\w+)\b(?=[ .\]\n\r]|$)/g;

    let match;
    let dagNames = [];

    // Use RegExp.exec in a loop to find multiple matches in the input string
    while ((match = dagNamePattern.exec(str)) !== null) {
      // Avoid capturing known words that precede a DAG name
      // TODO: This is terribly brittle
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
        "on",
        "hourly",
        "Data",
        "Loss",
        "ERROR",
        "Airflow",
        "airflow",
        "Analytics",
      ];

      if (nonDagKeywords.indexOf(match[1]) === -1) {
        // The captured group is at index 1 of the match array
        dagNames.push(match[1]);
      }
    }

    return dagNames.length > 0 ? dagNames[0] : null;
  }
}
