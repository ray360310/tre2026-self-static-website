import { useEffect, useState } from "react";

import type { OfficialEventData } from "../../types/officialData";
import type { UserScheduleEntry, UserScheduleRecord } from "../../types/userSchedule";
import { CatalogFilters } from "./CatalogFilters";

interface EventCatalogTabProps {
  officialData: OfficialEventData;
  schedule: UserScheduleRecord;
  onAddPurchasedEntry: (entry: UserScheduleEntry) => void;
  onRemovePurchasedEntry: (entryId: string) => void;
  onAddCandidateEntry: (entry: UserScheduleEntry) => void;
  onRemoveCandidateEntry: (entryId: string) => void;
}

interface PurchasedEntryDraft {
  personName: string;
  planOption: string;
  customPlanName: string;
  date: string;
  start: string;
  end: string;
  notes: string;
}

type DraftFieldError = Partial<
  Record<"personName" | "planName" | "date" | "start" | "end", string>
>;

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

function extractPlanOptions(fullContent: string): string[] {
  const options = new Set<string>();
  const patterns = [
    /〖([^〗]{1,30})〗/gu,
    /✨([^✨\n]{1,30})✨/gu,
    /♡([^♡\n]{1,30})/gu
  ];

  for (const pattern of patterns) {
    for (const match of fullContent.matchAll(pattern)) {
      const value = match[1]?.trim();

      if (value && !/活動地點|正式售票|提醒|注意|福利內容|限定福利|須知/u.test(value)) {
        options.add(value);
      }
    }
  }

  return [...options].slice(0, 12);
}

function normalizeDateForInput(date: string): string {
  return date.replaceAll("/", "-");
}

function normalizeDateForStorage(date: string): string {
  return date.replaceAll("-", "/");
}

function getResolvedPlanName(draft: PurchasedEntryDraft): string {
  if (draft.planOption === "其他") {
    return draft.customPlanName.trim();
  }

  return draft.planOption.trim();
}

export function EventCatalogTab({
  officialData,
  schedule,
  onAddPurchasedEntry,
  onRemovePurchasedEntry,
  onAddCandidateEntry,
  onRemoveCandidateEntry
}: EventCatalogTabProps) {
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedActress, setSelectedActress] = useState("");
  const [selectedPriceTag, setSelectedPriceTag] = useState("");
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [draftsByEventId, setDraftsByEventId] = useState<Record<string, PurchasedEntryDraft>>({});
  const [errorsByEventId, setErrorsByEventId] = useState<Record<string, DraftFieldError>>({});
  const vendors = collectSortedUnique(officialData.events.map((event) => event.vendorName));
  const actresses = collectSortedUnique(officialData.events.flatMap((event) => event.actressNames));
  const priceTags = collectSortedUnique(officialData.events.flatMap((event) => event.priceTags));

  const getDraft = (eventId: string, actressNames: string[]): PurchasedEntryDraft =>
    draftsByEventId[eventId] ?? {
      personName: actressNames[0] ?? "",
      planOption: "",
      customPlanName: "",
      date: "",
      start: "",
      end: "",
      notes: ""
    };

  const setDraftField = (
    eventId: string,
    actressNames: string[],
    field: keyof PurchasedEntryDraft,
    value: string
  ) => {
    setDraftsByEventId((current) => ({
      ...current,
      [eventId]: {
        ...getDraft(eventId, actressNames),
        [field]: value
      }
    }));
    setErrorsByEventId((current) => {
      if (!current[eventId]) {
        return current;
      }

      const next = { ...current };
      const nextErrors = { ...next[eventId] };
      const errorField =
        field === "planOption" || field === "customPlanName"
          ? "planName"
          : field === "personName" || field === "date" || field === "start" || field === "end"
            ? field
            : null;

      if (errorField) {
        delete nextErrors[errorField];
      }

      next[eventId] = nextErrors;
      return next;
    });
  };

  const clearDraft = (eventId: string) => {
    setDraftsByEventId((current) => {
      const next = { ...current };
      delete next[eventId];
      return next;
    });
    setErrorsByEventId((current) => {
      const next = { ...current };
      delete next[eventId];
      return next;
    });
  };

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

  const buildEntry = (event: OfficialEventData["events"][number]): UserScheduleEntry | null => {
    const draft = getDraft(event.id, event.actressNames);
    const resolvedPlanName = getResolvedPlanName(draft);
    const nextErrors: DraftFieldError = {};

    if (!draft.personName) {
      nextErrors.personName = "請選擇活動人物";
    }

    if (!resolvedPlanName) {
      nextErrors.planName = "請選擇方案名稱";
    }

    if (!draft.date) {
      nextErrors.date = "請選擇活動日期";
    }

    if (!draft.start) {
      nextErrors.start = "請選擇開始時間";
    }

    if (!draft.end) {
      nextErrors.end = "請選擇結束時間";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrorsByEventId((current) => ({
        ...current,
        [event.id]: nextErrors
      }));
      return null;
    }

    const normalizedPlanName = resolvedPlanName;
    const normalizedDate = normalizeDateForStorage(draft.date);
    const selectionLabel = `${draft.personName} ${normalizedPlanName}`;
    const entryId = [
      event.id,
      draft.personName,
      normalizedPlanName,
      normalizedDate,
      draft.start
    ]
      .join("-")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();

    return {
      id: entryId,
      sourceType: "official",
      officialEventId: event.id,
      officialEventTitle: event.title,
      selectionLabel,
      date: normalizedDate,
      start: draft.start,
      end: draft.end,
      vendorName: event.vendorName,
      peopleNames: draft.personName ? [draft.personName] : [],
      notes: draft.notes.trim() || null,
      sourceUrl: event.sourceUrl
    };
  };

  const handleAddPurchasedEntryClick = (event: OfficialEventData["events"][number]) => {
    const entry = buildEntry(event);

    if (!entry) {
      return;
    }

    onAddPurchasedEntry(entry);
    clearDraft(event.id);
  };

  const handleAddCandidateEntryClick = (event: OfficialEventData["events"][number]) => {
    const entry = buildEntry(event);

    if (!entry) {
      return;
    }

    onAddCandidateEntry(entry);
    clearDraft(event.id);
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
          const purchasedEntries = schedule.purchasedEntries.filter(
            (entry) => entry.officialEventId === event.id
          );
          const candidateEntries = schedule.candidateEntries.filter(
            (entry) => entry.officialEventId === event.id
          );
          const draft = getDraft(event.id, event.actressNames);
          const errors = errorsByEventId[event.id] ?? {};
          const planOptions = extractPlanOptions(event.fullContent);

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
                  <span>
                    {event.actressNames.length} 位人物
                    {purchasedEntries.length > 0 ? ` · 已購 ${purchasedEntries.length} 場` : ""}
                    {candidateEntries.length > 0 ? ` · 預選 ${candidateEntries.length} 場` : ""}
                  </span>
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
                    <div className="rounded-[1.25rem] bg-cyan-50 px-4 py-4 ring-1 ring-cyan-100">
                      <p className="text-sm font-semibold text-slate-950">加入我的已購活動</p>
                      {purchasedEntries.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {purchasedEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-3 ring-1 ring-cyan-100"
                            >
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {entry.selectionLabel}
                                </p>
                                <p className="text-xs text-slate-600">
                                  {entry.date} {entry.start}-{entry.end}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => onRemovePurchasedEntry(entry.id)}
                                className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                              >
                                移出已購
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {candidateEntries.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {candidateEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-3 ring-1 ring-fuchsia-100"
                            >
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {entry.selectionLabel}
                                </p>
                                <p className="text-xs text-slate-600">
                                  {entry.date} {entry.start}-{entry.end}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => onRemoveCandidateEntry(entry.id)}
                                className="rounded-full bg-fuchsia-700 px-3 py-1.5 text-xs font-semibold text-white"
                              >
                                移出預選
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <div className="mt-3 grid gap-3">
                        <label className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-slate-700">
                            活動人物 <span className="text-rose-600">*必填</span>
                          </span>
                          <select
                            aria-label="活動人物"
                            value={draft.personName}
                            onChange={(entryEvent) =>
                              setDraftField(
                                event.id,
                                event.actressNames,
                                "personName",
                                entryEvent.target.value
                              )
                            }
                            className="rounded-xl border-0 bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-cyan-100"
                          >
                            <option value="">請選擇人物</option>
                            {event.actressNames.map((name) => (
                              <option key={`${event.id}-${name}`} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                          {errors.personName ? (
                            <span className="text-xs font-semibold text-rose-600">
                              {errors.personName}
                            </span>
                          ) : null}
                        </label>
                        <label className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-slate-700">
                            方案名稱 <span className="text-rose-600">*必填</span>
                          </span>
                          <select
                            aria-label="方案名稱"
                            value={draft.planOption}
                            onChange={(entryEvent) =>
                              setDraftField(
                                event.id,
                                event.actressNames,
                                "planOption",
                                entryEvent.target.value
                              )
                            }
                            className="rounded-xl border-0 bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-cyan-100"
                          >
                            <option value="">請選擇方案</option>
                            {planOptions.map((option) => (
                              <option key={`${event.id}-${option}`} value={option}>
                                {option}
                              </option>
                            ))}
                            <option value="其他">其他</option>
                          </select>
                          {draft.planOption === "其他" ? (
                            <input
                              aria-label="其他方案名稱"
                              type="text"
                              value={draft.customPlanName}
                              onChange={(entryEvent) =>
                                setDraftField(
                                  event.id,
                                  event.actressNames,
                                  "customPlanName",
                                  entryEvent.target.value
                                )
                              }
                              className="rounded-xl border-0 bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-cyan-100"
                              placeholder="請輸入方案名稱"
                            />
                          ) : null}
                          {errors.planName ? (
                            <span className="text-xs font-semibold text-rose-600">
                              {errors.planName}
                            </span>
                          ) : null}
                        </label>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <label className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-slate-700">
                              活動日期 <span className="text-rose-600">*必填</span>
                            </span>
                            <input
                              aria-label="活動日期"
                              type="date"
                              value={normalizeDateForInput(draft.date)}
                              onChange={(entryEvent) =>
                                setDraftField(
                                  event.id,
                                  event.actressNames,
                                  "date",
                                  entryEvent.target.value
                                )
                              }
                              className="rounded-xl border-0 bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-cyan-100"
                            />
                            {errors.date ? (
                              <span className="text-xs font-semibold text-rose-600">
                                {errors.date}
                              </span>
                            ) : null}
                          </label>
                          <label className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-slate-700">
                              開始時間 <span className="text-rose-600">*必填</span>
                            </span>
                            <input
                              aria-label="開始時間"
                              type="time"
                              value={draft.start}
                              onChange={(entryEvent) =>
                                setDraftField(
                                  event.id,
                                  event.actressNames,
                                  "start",
                                  entryEvent.target.value
                                )
                              }
                              className="rounded-xl border-0 bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-cyan-100"
                            />
                            {errors.start ? (
                              <span className="text-xs font-semibold text-rose-600">
                                {errors.start}
                              </span>
                            ) : null}
                          </label>
                          <label className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-slate-700">
                              結束時間 <span className="text-rose-600">*必填</span>
                            </span>
                            <input
                              aria-label="結束時間"
                              type="time"
                              value={draft.end}
                              onChange={(entryEvent) =>
                                setDraftField(
                                  event.id,
                                  event.actressNames,
                                  "end",
                                  entryEvent.target.value
                                )
                              }
                              className="rounded-xl border-0 bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-cyan-100"
                            />
                            {errors.end ? (
                              <span className="text-xs font-semibold text-rose-600">
                                {errors.end}
                              </span>
                            ) : null}
                          </label>
                        </div>
                        <label className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-slate-700">備註</span>
                          <textarea
                            aria-label="備註"
                            value={draft.notes}
                            onChange={(entryEvent) =>
                              setDraftField(
                                event.id,
                                event.actressNames,
                                "notes",
                                entryEvent.target.value
                              )
                            }
                            className="min-h-20 rounded-xl border-0 bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-cyan-100"
                            placeholder="可填集合地點、自己的備忘"
                          />
                        </label>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleAddCandidateEntryClick(event)}
                            className="rounded-full bg-fuchsia-100 px-4 py-2 text-sm font-semibold text-fuchsia-800 ring-1 ring-fuchsia-200"
                          >
                            加入預選
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddPurchasedEntryClick(event)}
                            className="rounded-full bg-cyan-700 px-4 py-2 text-sm font-semibold text-white"
                          >
                            加入已購
                          </button>
                        </div>
                      </div>
                    </div>
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
