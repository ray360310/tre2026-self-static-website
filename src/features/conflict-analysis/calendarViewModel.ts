import { eventsOverlap, parseTimeToMinutes } from "../../lib/normalizeEvents";
import type { AppData, EventRecord } from "../../types/data";
import type { OfficialEventData } from "../../types/officialData";
import type { UserScheduleRecord } from "../../types/userSchedule";

const CALENDAR_DATES = [
  { date: "2026/07/03", isoDate: "2026-07-03", label: "7/3 Fri" },
  { date: "2026/07/04", isoDate: "2026-07-04", label: "7/4 Sat" },
  { date: "2026/07/05", isoDate: "2026-07-05", label: "7/5 Sun" }
] as const;

export interface CalendarBlock {
  id: string;
  kind: "purchased" | "benefit";
  title: string;
  subtitle: string;
  date: string;
  start: string;
  end: string;
  startMinutes: number;
  endMinutes: number;
  cardType: "gold" | "silver" | null;
  conflictLabels: string[];
  vendorName: string | null;
  peopleNames: string[];
  notes: string | null;
  sourceUrl: string | null;
  description: string | null;
  location: string | null;
}

export interface CalendarDayColumn {
  date: string;
  isoDate: string;
  label: string;
  blocks: CalendarBlock[];
}

export interface ThreeDayCalendarModel {
  days: CalendarDayColumn[];
  minHour: number;
  maxHour: number;
  purchasedCount: number;
  benefitCount: number;
  conflictCount: number;
}

function sortBlocks(left: CalendarBlock, right: CalendarBlock): number {
  return (
    left.startMinutes - right.startMinutes ||
    left.endMinutes - right.endMinutes ||
    left.title.localeCompare(right.title, "zh-Hant")
  );
}

function toBenefitBlock(
  event: EventRecord,
  cardType: "gold" | "silver",
  data: AppData
): CalendarBlock | null {
  if (!event.start || !event.end) {
    return null;
  }

  return {
    id: event.id,
    kind: "benefit",
    title: event.title,
    subtitle: cardType === "gold" ? "金卡權益" : "白銀卡權益",
    date: event.date,
    start: event.start,
    end: event.end,
    startMinutes: parseTimeToMinutes(event.start),
    endMinutes: parseTimeToMinutes(event.end),
    cardType,
    conflictLabels: [],
    vendorName: null,
    peopleNames: event.peopleIds
      .map((personId) => data.peopleById[personId]?.name)
      .filter((name): name is string => Boolean(name)),
    notes: event.notes,
    sourceUrl: event.source,
    description: event.description,
    location: event.location
  };
}

function resolveBenefitBlocks(data: AppData): CalendarBlock[] {
  const goldBlocks = data.rules.goldCardConflictEventIds
    .map((eventId) => data.eventsById[eventId])
    .filter((event): event is EventRecord => Boolean(event))
    .map((event) => toBenefitBlock(event, "gold", data))
    .filter((block): block is CalendarBlock => block !== null);
  const silverBlocks = data.rules.silverCardConflictEventIds
    .map((eventId) => data.eventsById[eventId])
    .filter((event): event is EventRecord => Boolean(event))
    .map((event) => toBenefitBlock(event, "silver", data))
    .filter((block): block is CalendarBlock => block !== null);

  return [...goldBlocks, ...silverBlocks];
}

function resolvePurchasedBlocks(
  schedule: UserScheduleRecord,
  officialData: OfficialEventData
): CalendarBlock[] {
  return schedule.purchasedEntries.map((entry) => {
    const officialEvent = officialData.events.find(
      (event) => event.id === entry.officialEventId
    );

    return {
      id: entry.id,
      kind: "purchased",
      title: entry.officialEventTitle,
      subtitle: entry.selectionLabel,
      date: entry.date,
      start: entry.start,
      end: entry.end,
      startMinutes: parseTimeToMinutes(entry.start),
      endMinutes: parseTimeToMinutes(entry.end),
      cardType: null,
      conflictLabels: [],
      vendorName: entry.vendorName,
      peopleNames: entry.peopleNames,
      notes: entry.notes,
      sourceUrl: entry.sourceUrl,
      description: officialEvent?.fullContent ?? null,
      location: null
    };
  });
}

function overlaps(left: CalendarBlock, right: CalendarBlock): boolean {
  return eventsOverlap(
    {
      id: left.id,
      title: left.title,
      date: left.date,
      type: left.kind === "benefit" ? "card-benefit" : "purchased",
      peopleIds: [],
      start: left.start,
      end: left.end,
      startMinutes: left.startMinutes,
      endMinutes: left.endMinutes
    },
    {
      id: right.id,
      title: right.title,
      date: right.date,
      type: right.kind === "benefit" ? "card-benefit" : "purchased",
      peopleIds: [],
      start: right.start,
      end: right.end,
      startMinutes: right.startMinutes,
      endMinutes: right.endMinutes
    }
  );
}

export function buildThreeDayCalendar(
  data: AppData,
  schedule: UserScheduleRecord,
  officialData: OfficialEventData
): ThreeDayCalendarModel {
  const purchasedBlocks = resolvePurchasedBlocks(schedule, officialData).filter((block) =>
    CALENDAR_DATES.some((day) => day.date === block.date)
  );
  const benefitBlocks = resolveBenefitBlocks(data).filter((block) =>
    CALENDAR_DATES.some((day) => day.date === block.date)
  );

  let conflictCount = 0;

  for (const purchasedBlock of purchasedBlocks) {
    const matchingBenefits = benefitBlocks.filter((benefitBlock) => overlaps(purchasedBlock, benefitBlock));
    purchasedBlock.conflictLabels = matchingBenefits.map((benefitBlock) =>
      benefitBlock.cardType === "gold" ? "撞到金卡" : "撞到白銀卡"
    );

    if (matchingBenefits.length > 0) {
      conflictCount += 1;
    }
  }

  const allBlocks = [...purchasedBlocks, ...benefitBlocks];
  const minStart = allBlocks.length > 0 ? Math.min(...allBlocks.map((block) => block.startMinutes)) : 10 * 60;
  const maxEnd = allBlocks.length > 0 ? Math.max(...allBlocks.map((block) => block.endMinutes)) : 22 * 60;
  const minHour = Math.max(0, Math.floor(minStart / 60));
  const maxHour = Math.min(24, Math.ceil(maxEnd / 60));

  return {
    days: CALENDAR_DATES.map((day) => ({
      ...day,
      blocks: [...purchasedBlocks, ...benefitBlocks]
        .filter((block) => block.date === day.date)
        .sort(sortBlocks)
    })),
    minHour,
    maxHour,
    purchasedCount: purchasedBlocks.length,
    benefitCount: benefitBlocks.length,
    conflictCount
  };
}
