import { describe, expect, test } from "vitest";

import {
  buildOfficialPeople,
  extractOfficialEventRecord,
  extractOfficialEventSeeds
} from "../jkfaceSync";

describe("jkfaceSync", () => {
  test("extracts official event seeds from the list page", () => {
    const html = `
      <section class="flex flex-col gap-2 md:gap-3">
        <section>
          <div translate="no">ACT</div>
        </section>
        <section>
          <img src="https://example.com/banner.jpg" alt="ACT 激情水鑽感謝祭 的活動圖片" />
          <a href="/events/315">來去逛逛</a>
        </section>
      </section>
    `;

    expect(extractOfficialEventSeeds(html)).toEqual([
      {
        title: "ACT 激情水鑽感謝祭",
        sourceUrl: "https://jkface.net/events/315",
        bannerImageUrl: "https://example.com/banner.jpg",
        vendorName: "ACT"
      }
    ]);
  });

  test("extracts official event detail content, actresses, prices, and detail images", () => {
    const html = `
      <html>
        <head>
          <title>ACT 激情水鑽感謝祭 - JKFace 娛樂活動</title>
          <meta name="description" content="2026-07-03 開跑！包括 音無鈴 與人氣 IP 都將參與【ACT 激情水鑽感謝祭】。立即參加，享受最有溫度的娛樂體驗！" />
          <meta property="og:image" content="https://example.com/og-banner.jpg" />
        </head>
        <body>
          <main>
            <section>
              <div id="participants"></div>
              <img src="https://example.com/a.jpg" alt="音無鈴 的頭像" />
              <img src="https://example.com/b.jpg" alt="雛乃花音 的頭像" />
              <img src="https://example.com/c.jpg" alt="訪客 的頭像" />
            </section>
            <section>
              <pre>
                活動內容
                每一場活動的價格為35000個紅鑽
                本活動可使用FACE券報名
                使用Face會員Qrcode報到活動時不可截圖
              </pre>
            </section>
            <section>
              <img src="https://example.com/detail-1.jpg" alt="ACT 激情水鑽感謝祭 的詳細資訊圖片" />
              <img src="https://example.com/detail-2.jpg" alt="ACT 激情水鑽感謝祭 的詳細資訊圖片" />
            </section>
          </main>
        </body>
      </html>
    `;

    const record = extractOfficialEventRecord(html, {
      title: "ACT 激情水鑽感謝祭",
      sourceUrl: "https://jkface.net/events/315",
      bannerImageUrl: "https://example.com/list-banner.jpg",
      vendorName: "ACT"
    });

    expect(record).toMatchObject({
      id: "jkface-event-315",
      title: "ACT 激情水鑽感謝祭",
      bannerImageUrl: "https://example.com/og-banner.jpg",
      sourceUrl: "https://jkface.net/events/315",
      vendorName: "ACT",
      actressNames: ["音無鈴", "雛乃花音"],
      priceTags: ["FACE券", "鑽石"]
    });
    expect(record.detailImageUrls).toEqual([
      "https://example.com/detail-1.jpg",
      "https://example.com/detail-2.jpg"
    ]);
    expect(record.fullContent).toContain("35000個紅鑽");
  });

  test("extracts actresses from profile-card layouts when participants section is absent", () => {
    const html = `
      <html>
        <head>
          <title>夢想企画感謝祭 - JKFace 娛樂活動</title>
          <meta
            name="description"
            content="2026-07-03 開跑！包括 楓富愛 與人氣 IP 都將參與【夢想企画感謝祭】。立即參加，享受最有溫度的娛樂體驗！"
          />
          <meta
            property="og:image"
            content="https://example.com/dream-banner.jpg"
          />
        </head>
        <body>
          <main>
            <section>
              <a href="/profile/5888981">
                <img src="https://example.com/a.jpg" alt="楓富愛 的頭像" />
                <span translate="no">楓富愛</span>
              </a>
              <a href="/profile/6229677">
                <img src="https://example.com/b.jpg" alt="小花暖 的頭像" />
                <span translate="no">小花暖</span>
              </a>
              <a href="/profile/6229676">
                <img src="https://example.com/c.jpg" alt="東實果 的頭像" />
                <span translate="no">東實果</span>
              </a>
            </section>
            <section>
              <img
                src="https://example.com/detail-1.jpg"
                alt="夢想企画感謝祭 的詳細資訊圖片"
              />
            </section>
          </main>
        </body>
      </html>
    `;

    const record = extractOfficialEventRecord(html, {
      title: "夢想企画感謝祭",
      sourceUrl: "https://jkface.net/events/326",
      bannerImageUrl: "https://example.com/list-banner.jpg",
      vendorName: "夢想企画"
    });

    expect(record).toMatchObject({
      id: "jkface-event-326",
      title: "夢想企画感謝祭",
      bannerImageUrl: "https://example.com/dream-banner.jpg",
      sourceUrl: "https://jkface.net/events/326",
      vendorName: "夢想企画",
      actressNames: ["楓富愛", "小花暖", "東實果"]
    });
    expect(record.detailImageUrls).toEqual(["https://example.com/detail-1.jpg"]);
  });

  test("builds a deduplicated people list from official event actress names", () => {
    const people = buildOfficialPeople([
      {
        id: "jkface-event-315",
        title: "ACT 激情水鑽感謝祭",
        bannerImageUrl: null,
        detailImageUrls: [],
        sourceUrl: "https://jkface.net/events/315",
        vendorName: "ACT",
        actressNames: ["音無鈴", "雛乃花音"],
        priceTags: ["鑽石"],
        fullContent: "x"
      },
      {
        id: "jkface-event-316",
        title: "另一場活動",
        bannerImageUrl: null,
        detailImageUrls: [],
        sourceUrl: "https://jkface.net/events/316",
        vendorName: "ACT",
        actressNames: ["雛乃花音"],
        priceTags: [],
        fullContent: "x"
      }
    ]);

    expect(people).toEqual([
      {
        id: "jkface-person-音無鈴",
        image: null,
        name: "音無鈴",
        sourceUrl: "https://jkface.net/events/315"
      },
      {
        id: "jkface-person-雛乃花音",
        image: null,
        name: "雛乃花音",
        sourceUrl: "https://jkface.net/events/315"
      }
    ]);
  });
});
