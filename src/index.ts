import "dotenv/config";

import playwright from "playwright";
import * as fs from "node:fs/promises";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
dayjs.extend(customParseFormat);

import { Thread } from "./thread-parser";
import ThreadProcessor from "./thread-processor";

(async () => {
  if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
    return;
  }

  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(
    "https://lists.wikimedia.org/accounts/login/?next=/postorius/lists/data-engineering-alerts.lists.wikimedia.org/"
  );

  await page.setViewportSize({ width: 1080, height: 1024 });

  await page.fill('input[id="id_login"]', process.env.EMAIL_USERNAME);
  await page.fill('input[id="id_password"]', process.env.EMAIL_PASSWORD);

  await page.click('.login button.btn-primary[type="submit"]'),
  await page.waitForURL('**/*');

  await page.goto(
    "https://lists.wikimedia.org/hyperkitty/list/data-engineering-alerts@lists.wikimedia.org/latest?page=1"
  );

  const json = {
    data: [] as Thread[],
  };

  const threadProcessor = new ThreadProcessor();

  const pageLinks = await page.$$("a.page-link");
  const lastPage = await pageLinks[pageLinks.length - 2].evaluate((el) =>
    parseInt(el.textContent || "1")
  );
  console.log(`Last Page: ${lastPage}`);
  json.data.push(...(await threadProcessor.getThreadsDataFromPage(page)));

  for (let i = 2; i <= 30; i++) {
    console.log(`Processing Page: ${i}`);
    await page.goto(
      `https://lists.wikimedia.org/hyperkitty/list/data-engineering-alerts@lists.wikimedia.org/latest?page=${i}`
    );

    json.data.push(...(await threadProcessor.getThreadsDataFromPage(page)));
  }

  await browser.close();

  console.log("Writing to file");
  await fs.writeFile("data.json", JSON.stringify(json), "utf8");
})();
