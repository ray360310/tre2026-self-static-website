import { load } from "cheerio";

import type { OfficialEventRecord, OfficialPersonRecord } from "../types/officialData";

const JKFACE_BASE_URL = "https://jkface.net";
const OFFICIAL_EVENT_SUFFIX = " - JKFace 娛樂活動";

export interface OfficialEventSeed {
  title: string;
  sourceUrl: string;
  bannerImageUrl: string | null;
  vendorName: string | null;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function toAbsoluteUrl(value: string | undefined | null): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value, JKFACE_BASE_URL).toString();
  } catch {
    return null;
  }
}

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function slugify(value: string): string {
  const ascii = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return ascii || value.replace(/\s+/g, "-");
}

function eventIdFromUrl(sourceUrl: string, title: string): string {
  const match = sourceUrl.match(/\/events\/(\d+)/);

  if (match) {
    return `jkface-event-${match[1]}`;
  }

  return `jkface-event-${slugify(title)}`;
}

function extractPriceTags(text: string): string[] {
  const tags: string[] = [];

  if (/face券/i.test(text)) {
    tags.push("FACE券");
  }

  if (/紅鑽|鑽石/.test(text)) {
    tags.push("鑽石");
  }

  return tags;
}

function extractActressNamesFromMetaDescription(description: string): string[] {
  const match = description.match(/包括\s+(.+?)\s+都將參與/u);

  if (!match) {
    return [];
  }

  return dedupeStrings(
    match[1]
      .split(/[、，,與和]/u)
      .map((value) => value.trim())
      .filter((value) => value && !/人氣\s*IP/u.test(value))
  );
}

export function extractOfficialEventSeeds(listHtml: string): OfficialEventSeed[] {
  const $ = load(listHtml);
  const seedsByUrl = new Map<string, OfficialEventSeed>();

  $('img[alt$=" 的活動圖片"]').each((_, imageElement) => {
    const image = $(imageElement);
    const cardSection = image.closest("section");
    const eventLink = cardSection.find('a[href^="/events/"]').first();
    const sourceUrl = toAbsoluteUrl(eventLink.attr("href"));
    const title = (image.attr("alt") ?? "").replace(/\s+的活動圖片$/, "").trim();

    if (!sourceUrl || !title) {
      return;
    }

    const vendorSection = cardSection.closest("section.flex.flex-col.gap-2, section.flex.flex-col.gap-2.md\\:gap-3");
    const vendorName =
      vendorSection.children("section").first().find('div[translate="no"]').first().text().trim() ||
      null;

    seedsByUrl.set(sourceUrl, {
      title,
      sourceUrl,
      bannerImageUrl: toAbsoluteUrl(image.attr("src")),
      vendorName
    });
  });

  return [...seedsByUrl.values()];
}

export function extractOfficialEventRecord(
  detailHtml: string,
  seed: OfficialEventSeed
): OfficialEventRecord {
  const $ = load(detailHtml);
  const titleTag = $("title").first().text().trim();
  const title = titleTag.endsWith(OFFICIAL_EVENT_SUFFIX)
    ? titleTag.slice(0, -OFFICIAL_EVENT_SUFFIX.length)
    : seed.title;
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() ?? "";
  const bannerImageUrl =
    toAbsoluteUrl($('meta[property="og:image"]').attr("content")) ?? seed.bannerImageUrl;
  const preText = $("pre").first().text().trim();
  const fullContent = normalizeWhitespace(preText || $("main").text());
  const detailImageUrls = dedupeStrings(
    $(`img[alt="${title} 的詳細資訊圖片"]`)
      .map((_, imageElement) => toAbsoluteUrl($(imageElement).attr("src")))
      .get()
      .filter((value): value is string => Boolean(value))
  );
  const actressNames = dedupeStrings([
    ...$("#participants")
      .parent()
      .find('img[alt$=" 的頭像"]')
      .map((_, imageElement) => ($(imageElement).attr("alt") ?? "").replace(/\s+的頭像$/, "").trim())
      .get()
      .filter((name) => name && name !== "訪客"),
    ...extractActressNamesFromMetaDescription(metaDescription)
  ]);

  return {
    id: eventIdFromUrl(seed.sourceUrl, title),
    title,
    bannerImageUrl,
    detailImageUrls,
    sourceUrl: seed.sourceUrl,
    vendorName: seed.vendorName,
    actressNames,
    priceTags: extractPriceTags(`${metaDescription}\n${fullContent}`),
    fullContent
  };
}

export function buildOfficialPeople(events: OfficialEventRecord[]): OfficialPersonRecord[] {
  const peopleById = new Map<string, OfficialPersonRecord>();

  events.forEach((event) => {
    event.actressNames.forEach((name) => {
      const id = `jkface-person-${slugify(name)}`;

      if (!peopleById.has(id)) {
        peopleById.set(id, {
          id,
          name,
          image: null,
          sourceUrl: event.sourceUrl
        });
      }
    });
  });

  return [...peopleById.values()].sort((left, right) =>
    left.name.localeCompare(right.name, "zh-Hant")
  );
}
