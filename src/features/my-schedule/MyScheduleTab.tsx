import type { OfficialEventData } from "../../types/officialData";
import type { UserScheduleEntry, UserScheduleRecord } from "../../types/userSchedule";

interface MyScheduleTabProps {
  officialData: OfficialEventData;
  schedule: UserScheduleRecord;
  onRemovePurchasedEntry: (entryId: string) => void;
  onRemoveCandidateEntry: (entryId: string) => void;
}

function sortEntries(
  left: UserScheduleEntry,
  right: UserScheduleEntry
): number {
  return (
    left.date.localeCompare(right.date) ||
    left.start.localeCompare(right.start) ||
    left.end.localeCompare(right.end) ||
    left.officialEventTitle.localeCompare(right.officialEventTitle, "zh-Hant")
  );
}

interface ScheduleEntrySectionProps {
  emptyText: string;
  entries: UserScheduleEntry[];
  officialData: OfficialEventData;
  removeLabel: string;
  statusLabel: string;
  statusTone: "purchased" | "candidate";
  title: string;
  description: string;
  onRemove: (entryId: string) => void;
}

function ScheduleEntrySection({
  emptyText,
  entries,
  officialData,
  removeLabel,
  statusLabel,
  statusTone,
  title,
  description,
  onRemove
}: ScheduleEntrySectionProps) {
  const badgeClasses =
    statusTone === "purchased"
      ? "bg-cyan-100 text-cyan-900"
      : "bg-fuchsia-100 text-fuchsia-900";
  const vendorClasses =
    statusTone === "purchased" ? "text-cyan-700" : "text-fuchsia-700";
  const noteClasses =
    statusTone === "purchased" ? "text-cyan-800" : "text-fuchsia-800";

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      {entries.length > 0 ? (
        <div className="space-y-3">
          {entries.map((entry) => {
            const officialEvent = officialData.events.find(
              (event) => event.id === entry.officialEventId
            );

            return (
              <article
                key={entry.id}
                className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-slate-200/80"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className={`text-xs font-semibold uppercase tracking-[0.12em] ${vendorClasses}`}>
                      {entry.vendorName ?? "官方活動"}
                    </p>
                    <h3 className="text-base font-semibold text-slate-900">
                      {entry.officialEventTitle}
                    </h3>
                    <p className="text-sm font-medium text-slate-700">
                      {entry.selectionLabel}
                    </p>
                    <p className="text-sm text-slate-600">
                      {entry.date} {entry.start}-{entry.end}
                    </p>
                    {entry.peopleNames.length > 0 ? (
                      <p className="text-sm text-slate-500">{entry.peopleNames.join("、")}</p>
                    ) : null}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses}`}>
                    {statusLabel}
                  </span>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    aria-label={`${removeLabel} ${entry.officialEventTitle}`}
                    onClick={() => onRemove(entry.id)}
                    className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    刪除
                  </button>
                </div>
                {entry.notes ? <p className={`mt-3 text-sm ${noteClasses}`}>{entry.notes}</p> : null}
                {officialEvent?.fullContent ? (
                  <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm text-slate-600">
                    {officialEvent.fullContent}
                  </p>
                ) : null}
                <a
                  href={entry.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-sm font-semibold text-amber-700 underline decoration-amber-300 underline-offset-4"
                >
                  查看官方頁面
                </a>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="rounded-[1.25rem] bg-white px-4 py-4 text-sm text-slate-600 ring-1 ring-slate-200">
          {emptyText}
        </p>
      )}
    </section>
  );
}

export function MyScheduleTab({
  officialData,
  schedule,
  onRemovePurchasedEntry,
  onRemoveCandidateEntry
}: MyScheduleTabProps) {
  const purchasedEntries = [...schedule.purchasedEntries].sort(sortEntries);
  const candidateEntries = [...schedule.candidateEntries].sort(sortEntries);

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,_#132033_0%,_#1e4f7a_48%,_#d8eef8_100%)] px-5 py-5 text-white shadow-[0_28px_60px_rgba(24,57,94,0.22)]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100/90">
          My Purchased Schedule
        </p>
        <h2 className="mt-2 text-2xl font-semibold">已購活動清單</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-cyan-50/90">
          這裡會顯示你從 tab3 加入的已購與預選活動，依實際日期與時間排序。
        </p>
      </section>
      <ScheduleEntrySection
        emptyText="尚未加入已購活動"
        entries={purchasedEntries}
        officialData={officialData}
        removeLabel="刪除"
        statusLabel="已加入"
        statusTone="purchased"
        title="我的已購活動"
        description="目前只會列出你實際加入的官方活動場次。"
        onRemove={onRemovePurchasedEntry}
      />
      <ScheduleEntrySection
        emptyText="尚未加入預選活動"
        entries={candidateEntries}
        officialData={officialData}
        removeLabel="刪除預選"
        statusLabel="預選"
        statusTone="candidate"
        title="我的預選活動"
        description="這裡會列出你想買但尚未購買的官方活動，方便後續在 tab2 看衝突。"
        onRemove={onRemoveCandidateEntry}
      />
    </div>
  );
}
