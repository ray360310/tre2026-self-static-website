import { useEffect, useState } from "react";

import type { OfficialEventData } from "../../types/officialData";
import { CatalogFilters } from "./CatalogFilters";

interface EventCatalogTabProps {
  officialData: OfficialEventData;
}

function collectSortedUnique(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value && value.trim())))]
    .sort((left, right) => left.localeCompare(right, "zh-Hant"));
}

function tagClasses(tone: "vendor" | "actress" | "price"): string {
  if (tone === "vendor") {
    return "bg-slate-900 text-white";
  }

  if (tone === "price") {
    return "bg-amber-100 text-amber-900";
  }

  return "bg-rose-100 text-rose-900";
}

export function EventCatalogTab({ officialData }: EventCatalogTabProps) {
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedActress, setSelectedActress] = useState("");
  const [selectedPriceTag, setSelectedPriceTag] = useState("");
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const vendors = collectSortedUnique(officialData.events.map((event) => event.vendorName));
  const actresses = collectSortedUnique(officialData.events.flatMap((event) => event.actressNames));
  const priceTags = collectSortedUnique(officialData.events.flatMap((event) => event.priceTags));

  useEffect(() => {
    if (selectedVendor && !vendors.includes(selectedVendor)) {
      setSelectedVendor("");
    }
  }, [selectedVendor, vendors]);

  useEffect(() => {
    if (selectedActress && !actresses.includes(selectedActress)) {
      setSelectedActress("");
    }
  }, [actresses, selectedActress]);

  useEffect(() => {
    if (selectedPriceTag && !priceTags.includes(selectedPriceTag)) {
      setSelectedPriceTag("");
    }
  }, [priceTags, selectedPriceTag]);

  const visibleEvents = officialData.events.filter((event) => {
    const matchesVendor = selectedVendor ? event.vendorName === selectedVendor : true;
    const matchesActress = selectedActress
      ? event.actressNames.includes(selectedActress)
      : true;
    const matchesPriceTag = selectedPriceTag
      ? event.priceTags.includes(selectedPriceTag)
      : true;

    return matchesVendor && matchesActress && matchesPriceTag;
  });

  const resetFilters = () => {
    setSelectedVendor("");
    setSelectedActress("");
    setSelectedPriceTag("");
  };

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,_#241512_0%,_#5a2317_45%,_#f0a65a_100%)] px-5 py-5 text-white shadow-[0_28px_60px_rgba(88,35,15,0.28)]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-100/90">
          JKFace Official
        </p>
        <h2 className="mt-2 text-2xl font-semibold">TRE2026 官方活動總表</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-amber-50/90">
          第三頁只顯示官方活動資料。可依廠商、女優、票種篩選，點開後直接查看完整活動內容與詳細圖片。
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-white/16 px-3 py-1.5">
            共 {officialData.events.length} 個活動
          </span>
          <span className="rounded-full bg-white/16 px-3 py-1.5">
            共 {officialData.people.length} 位人物
          </span>
          <span className="rounded-full bg-white/16 px-3 py-1.5">
            目前顯示 {visibleEvents.length} 個結果
          </span>
        </div>
      </section>
      <CatalogFilters
        vendors={vendors}
        actresses={actresses}
        priceTags={priceTags}
        selectedVendor={selectedVendor}
        selectedActress={selectedActress}
        selectedPriceTag={selectedPriceTag}
        onVendorChange={setSelectedVendor}
        onActressChange={setSelectedActress}
        onPriceTagChange={setSelectedPriceTag}
        onReset={resetFilters}
      />
      <section className="space-y-3">
        {visibleEvents.length === 0 ? (
          <div className="rounded-[1.5rem] bg-white px-5 py-8 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-200">
            <p className="text-base font-semibold text-slate-950">找不到符合條件的活動</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              可以清除篩選條件後重新查看全部官方活動。
            </p>
          </div>
        ) : null}
        {visibleEvents.map((event) => {
          const isExpanded = expandedEventId === event.id;

          return (
            <article
              key={event.id}
              className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-200"
            >
              {event.bannerImageUrl ? (
                <img
                  src={event.bannerImageUrl}
                  alt={`${event.title} banner`}
                  className="aspect-[16/9] w-full object-cover"
                />
              ) : (
                <div className="aspect-[16/9] w-full bg-[linear-gradient(135deg,_#f4e4d0_0%,_#f7f3ed_55%,_#fff_100%)]" />
              )}
              <div className="space-y-4 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                      {event.vendorName ?? "官方活動"}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold leading-7 text-slate-950">
                      {event.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedEventId((current) => (current === event.id ? null : event.id))
                    }
                    className="shrink-0 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    {isExpanded ? "收合內容" : "展開內容"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.vendorName ? (
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tagClasses("vendor")}`}>
                      {event.vendorName}
                    </span>
                  ) : null}
                  {event.priceTags.map((tag) => (
                    <span
                      key={`${event.id}-${tag}`}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tagClasses("price")}`}
                    >
                      {tag}
                    </span>
                  ))}
                  {event.actressNames.slice(0, isExpanded ? event.actressNames.length : 6).map((name) => (
                    <span
                      key={`${event.id}-${name}`}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tagClasses("actress")}`}
                    >
                      {name}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-500">
                  <span>{event.actressNames.length} 位人物</span>
                  <a
                    href={event.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-700 underline decoration-amber-300 underline-offset-4"
                  >
                    官方頁面
                  </a>
                </div>
                {isExpanded ? (
                  <div className="space-y-4 border-t border-slate-200 pt-4">
                    <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4">
                      <p className="mb-2 text-sm font-semibold text-slate-950">活動內容</p>
                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {event.fullContent}
                      </p>
                    </div>
                    {event.detailImageUrls.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-slate-950">詳細圖片</p>
                        <div className="space-y-3">
                          {event.detailImageUrls.map((imageUrl, index) => (
                            <img
                              key={imageUrl}
                              src={imageUrl}
                              alt={`${event.title} 詳細圖片 ${index + 1}`}
                              className="w-full rounded-[1.25rem] object-cover ring-1 ring-slate-200"
                            />
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
