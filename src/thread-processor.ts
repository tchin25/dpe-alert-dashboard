import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import * as puppeteer from "puppeteer";

import { Thread, ThreadParser } from "./thread-parser";
import AirflowParser from "./airflow-parser";
import NagiosParser from "./nagios-parser";
import SystemdtimerParser from "./systemdtimer-parser";
dayjs.extend(customParseFormat);

const parsers: ThreadParser[] = [
  new AirflowParser(),
  new NagiosParser(),
  new SystemdtimerParser(),
];

export default class ThreadProcessor {
  _parseDateStringToISOString(str: string): string {
    const date = str.split(", ")[1];
    const d = dayjs(date, "D MMMM YYYY HH:mm:ss");
    return d.toISOString();
  }

  async getThreadsDataFromPage(page: puppeteer.Page) {
    const threadData: Thread[] = [];
    const threads = await page.$$(".thread");
    for (let i = 0; i < threads.length; i++) {
      let data: Thread = {
        title: "",
        threadId: "",
        estimatedPostDate: "",
        lastReplyDate: "",
        author: "",
        details: "",
        tags: [],
      };
      const thread = threads[i];
      const titleEl = await thread.$(".thread-title");
      data.title = (await titleEl?.evaluate((el) => el.textContent)).trim();
      const link = await titleEl.$("a");
      data.threadId = await link.evaluate((el) => el.getAttribute("name"));
      const dateEl = await thread.$(".threa-date"); // Yes, the class has a typo
      data.lastReplyDate = this._parseDateStringToISOString(
        await dateEl?.evaluate((el) => el.getAttribute("title"))
      );
      data.estimatedPostDate = data.lastReplyDate;
      const authorEl = await thread.$(".thread-title+div");
      data.author =
        (await authorEl?.evaluate((el) =>
          el.textContent.split("by ")[1].trim()
        )) || "";
      const detailsEl = await thread.$("span.expander");
      data.details = await detailsEl?.evaluate((el) => el.textContent);

      for (const parser of parsers) {
        if (parser.isParseable(data)) {
          data = parser.parse(data);
          break;
        }
      }

      // data.details might have an excessive amount of text that we don't want to save
      data.details = data.details.substring(0, 500);

      threadData.push(data);
    }
    return threadData;
  }
}
