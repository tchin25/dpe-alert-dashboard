import "dotenv/config";

import puppeteer from "puppeteer";
import fs from "fs";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

import nagiosParser from "./nagios-parser";

export interface Meta {
  system: string
}

export interface Thread {
  title: string;
  threadId: string;
  lastReplyDate: string;
  author: string;
  meta: Meta;
}

(async () => {
  if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
    return;
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  // Default timezone is either set by account or is local time
  await page.emulateTimezone("Europe/London");

  await page.goto(
    "https://lists.wikimedia.org/accounts/login/?next=/postorius/lists/data-engineering-alerts.lists.wikimedia.org/"
  );

  await page.setViewport({ width: 1080, height: 1024 });

  await page.type('input[id="id_login"]', process.env.EMAIL_USERNAME);
  await page.type('input[id="id_password"]', process.env.EMAIL_PASSWORD);
  await Promise.all([
    page.waitForNavigation(),
    page.click('.login button.btn-primary[type="submit"]'),
  ]);

  await page.goto(
    "https://lists.wikimedia.org/hyperkitty/list/data-engineering-alerts@lists.wikimedia.org/latest?page=1"
  );

  const json = {
    data: [] as Thread[],
  };

  function parseDateStringToISOString(str: string): string {
    const date = str.split(", ")[1];
    const d = dayjs(date, "D MMMM YYYY HH:mm:ss");
    return d.toISOString();
  }

  async function getThreadsDataFromPage(page) {
    const threadData: Thread[] = [];
    const threads = await page.$$(".thread");
    for (let i = 0; i < threads.length; i++) {
      const data: Thread = {
        title: "",
        threadId: "",
        lastReplyDate: "",
        author: "",
        meta: { system: "" },
      };
      const thread = threads[i];
      const titleEl = await thread.$(".thread-title");
      data.title = (await titleEl?.evaluate((el) => el.textContent)).trim();
      const link = await titleEl.$("a");
      data.threadId = await link.evaluate((el) => el.getAttribute("name"));
      const dateEl = await thread.$(".threa-date"); // Yes, the class has a typo
      data.lastReplyDate = parseDateStringToISOString(
        await dateEl?.evaluate((el) => el.getAttribute("title"))
      );
      const authorEl = await thread.$(".thread-title+div");
      data.author =
        (await authorEl?.evaluate((el) =>
          el.textContent.split("by ")[1].trim()
        )) || "";
      const detailsEl = await thread.$(".thread-title+div");
      const details = await detailsEl?.evaluate((el) => el.textContent);

      if (data.author.includes("nagios")) {
        data.meta = nagiosParser(details);
      }
      threadData.push(data);
    }
    return threadData;
  }

  const pageLinks = await page.$$("a.page-link");
  const lastPage = await pageLinks[pageLinks.length - 2].evaluate((el) =>
    parseInt(el.textContent || "1")
  );
  console.log(`Last Page: ${lastPage}`);
  json.data.push(...(await getThreadsDataFromPage(page)));

  for (let i = 2; i <= lastPage; i++) {
    console.log(`Processing Page: ${i}`);
    await page.goto(
      `https://lists.wikimedia.org/hyperkitty/list/data-engineering-alerts@lists.wikimedia.org/latest?page=${i}`
    );

    json.data.push(...(await getThreadsDataFromPage(page)));
  }

  await browser.close();

  console.log("Writing to file");
  fs.writeFile("data.json", JSON.stringify(json), "utf8", () => { });
})();

/**
 * modeling for tables hopefully can be simliar data model as prometheus and druid: metric_name: string, labels Map<string, string>, value.
 */
