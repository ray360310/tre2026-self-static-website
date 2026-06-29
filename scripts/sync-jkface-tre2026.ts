import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildOfficialPeople,
  extractOfficialEventRecord,
  extractOfficialEventSeeds
} from "../src/lib/jkfaceSync";

const GOOGLEBOT_USER_AGENT =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const LIST_URL = "https://jkface.net/redexpo/2026/event";
const FETCH_TIMEOUT_MS = 20_000;
const CONCURRENCY = 6;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const response = await fetch(url, {
    headers: {
      "user-agent": GOOGLEBOT_USER_AGENT
    },
    signal: controller.signal
  });
  clearTimeout(timeout);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  mapper: (value: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < values.length) {
      const currentIndex = nextIndex;

      nextIndex += 1;
      results[currentIndex] = await mapper(values[currentIndex], currentIndex);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, () => worker()));

  return results;
}

async function main(): Promise<void> {
  const listHtml = await fetchHtml(LIST_URL);
  const seeds = extractOfficialEventSeeds(listHtml);
  console.log(`Found ${seeds.length} official event pages.`);

  let completed = 0;
  const events = await mapWithConcurrency(seeds, CONCURRENCY, async (seed, index) => {
    const detailHtml = await fetchHtml(seed.sourceUrl);
    completed += 1;
    console.log(`[${completed}/${seeds.length}] ${seed.title}`);
    return extractOfficialEventRecord(detailHtml, seed);
  });

  const people = buildOfficialPeople(events);

  writeFileSync(
    path.join(projectRoot, "src/data/official-events.json"),
    `${JSON.stringify(events, null, 2)}\n`
  );
  writeFileSync(
    path.join(projectRoot, "src/data/official-people.json"),
    `${JSON.stringify(people, null, 2)}\n`
  );

  console.log(`Synced ${events.length} official events and ${people.length} people.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
