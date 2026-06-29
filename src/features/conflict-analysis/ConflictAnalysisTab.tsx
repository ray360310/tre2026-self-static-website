import { useState } from "react";

import { ConflictBadge } from "../../components/ConflictBadge";
import type { AppData } from "../../types/data";
import type { OfficialEventData } from "../../types/officialData";
import type { UserScheduleRecord } from "../../types/userSchedule";
import { buildThreeDayCalendar } from "./calendarViewModel";
import { TimelineView } from "./TimelineView";

interface ConflictAnalysisTabProps {
  data: AppData;
  schedule: UserScheduleRecord;
  officialData: OfficialEventData;
}

export function ConflictAnalysisTab({
  data,
  schedule,
  officialData
}: ConflictAnalysisTabProps) {
  const calendar = buildThreeDayCalendar(data, schedule, officialData);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const selectedBlock =
    calendar.days.flatMap((day) => day.blocks).find((block) => block.id === selectedBlockId) ??
    null;

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,_#1f2937_0%,_#0f766e_50%,_#d1fae5_100%)] px-5 py-5 text-white shadow-[0_28px_60px_rgba(15,118,110,0.22)]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/90">
          Three-Day Calendar
        </p>
        <h2 className="mt-2 text-2xl font-semibold">三日行程月曆</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-50/90">
          只顯示 7/3、7/4、7/5，讓你直接看已購活動落在哪些時段，並檢查是否撞到金卡或白銀卡權益。
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-white/16 px-3 py-1.5">
            已購 {calendar.purchasedCount} 場
          </span>
          <span className="rounded-full bg-white/16 px-3 py-1.5">
            權益 {calendar.benefitCount} 場
          </span>
          <span className="rounded-full bg-white/16 px-3 py-1.5">
            衝突 {calendar.conflictCount} 場
          </span>
        </div>
      </section>

      <section className="rounded-[1.5rem] bg-slate-50 px-4 py-4 ring-1 ring-slate-200">
        <div className="flex flex-wrap gap-2">
          <ConflictBadge
            label={calendar.conflictCount > 0 ? `衝突 ${calendar.conflictCount} 場` : "目前沒有時段衝突"}
            tone={calendar.conflictCount > 0 ? "danger" : "neutral"}
          />
          <ConflictBadge
            label={calendar.benefitCount > 0 ? "已載入金卡/白銀卡權益" : "目前沒有權益時段"}
            tone={calendar.benefitCount > 0 ? "warning" : "neutral"}
          />
        </div>
        <p className="mt-3 text-sm text-slate-600">
          月曆中的深色卡片是你已購的活動，淺色卡片是主辦方固定權益時段。
        </p>
      </section>

      <TimelineView
        calendar={calendar}
        selectedBlockId={selectedBlockId}
        onSelectBlock={setSelectedBlockId}
      />

      {selectedBlock ? (
        <section
          aria-label="活動詳情面板"
          className="rounded-[1.5rem] bg-white px-4 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-200"
        >
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            活動詳情
          </h3>
          <h4 className="mt-2 text-lg font-semibold text-slate-950">{selectedBlock.title}</h4>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              {selectedBlock.subtitle}
            </span>
            {selectedBlock.vendorName ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                {selectedBlock.vendorName}
              </span>
            ) : null}
          </div>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>
              {selectedBlock.date} {selectedBlock.start}-{selectedBlock.end}
            </p>
            {selectedBlock.peopleNames.length > 0 ? (
              <p>{selectedBlock.peopleNames.join("、")}</p>
            ) : null}
            {selectedBlock.location ? <p>{selectedBlock.location}</p> : null}
            {selectedBlock.notes ? <p>{selectedBlock.notes}</p> : null}
            {selectedBlock.description ? (
              <p className="whitespace-pre-wrap text-slate-600">{selectedBlock.description}</p>
            ) : null}
          </div>
          {selectedBlock.sourceUrl ? (
            <a
              href={selectedBlock.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex text-sm font-semibold text-amber-700 underline decoration-amber-300 underline-offset-4"
            >
              查看官方頁面
            </a>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
