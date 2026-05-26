import { useEffect, useState } from "react";

import { ConflictBadge } from "../../components/ConflictBadge";
import { analyzeCandidateConflict } from "../../lib/conflicts";
import type { AppData } from "../../types/data";
import { TimelineView } from "./TimelineView";

interface ConflictAnalysisTabProps {
  data: AppData;
}

function sortEventsByTime(left: AppData["events"][number], right: AppData["events"][number]) {
  return (
    left.date.localeCompare(right.date) ||
    (left.start ?? "").localeCompare(right.start ?? "") ||
    (left.end ?? "").localeCompare(right.end ?? "") ||
    left.title.localeCompare(right.title)
  );
}

export function ConflictAnalysisTab({ data }: ConflictAnalysisTabProps) {
  const [selectedCandidateId, setSelectedCandidateId] = useState(
    data.candidateEvents[0]?.id ?? ""
  );

  useEffect(() => {
    const hasSelectedCandidate = data.candidateEvents.some(
      (event) => event.id === selectedCandidateId
    );

    if (!hasSelectedCandidate) {
      setSelectedCandidateId(data.candidateEvents[0]?.id ?? "");
    }
  }, [data.candidateEvents, selectedCandidateId]);

  const selectedCandidate =
    data.candidateEvents.find((event) => event.id === selectedCandidateId) ??
    data.candidateEvents[0];
  const analysis = selectedCandidate
    ? analyzeCandidateConflict(data, selectedCandidate.id)
    : null;
  const timelineEvents = selectedCandidate
    ? [
        selectedCandidate,
        ...analysis!.conflictingEventIds
          .map((eventId) => data.eventsById[eventId])
          .filter((event) => event !== undefined)
      ].sort(sortEventsByTime)
    : data.purchasedEvents;

  return (
    <div className="space-y-4">
      {data.candidateEvents.length > 0 ? (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-900">候補活動</h3>
          <div className="flex flex-wrap gap-2">
            {data.candidateEvents.map((event) => {
              const isSelected = event.id === selectedCandidate?.id;

              return (
                <button
                  key={event.id}
                  type="button"
                  className={`rounded-full px-3 py-2 text-sm font-semibold ring-1 transition ${
                    isSelected
                      ? "bg-amber-100 text-amber-900 ring-amber-300"
                      : "bg-white text-slate-700 ring-slate-200"
                  }`}
                  onClick={() => setSelectedCandidateId(event.id)}
                >
                  {event.title}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}
      <section className="rounded-[1.5rem] bg-slate-50 px-4 py-4 ring-1 ring-slate-200">
        <div className="flex flex-wrap gap-2">
          <ConflictBadge
            label={analysis?.purchasedConflictCount ? `撞到 ${analysis.purchasedConflictCount} 個已購活動` : "目前無已購衝突"}
            tone={analysis?.purchasedConflictCount ? "danger" : "neutral"}
          />
          <ConflictBadge
            label="影響金卡"
            tone={analysis?.affectsGoldCard ? "warning" : "neutral"}
          />
          <ConflictBadge
            label="影響白銀卡"
            tone={analysis?.affectsSilverCard ? "warning" : "neutral"}
          />
        </div>
        <p className="mt-3 text-sm text-slate-600">
          {selectedCandidate
            ? `正在檢查 ${selectedCandidate.title} 是否會和既有安排重疊。`
            : "目前沒有候補活動，先用這裡檢查後續想加購的時段。"}
        </p>
      </section>
      <TimelineView
        data={data}
        events={timelineEvents}
        selectedEventId={selectedCandidate?.id}
      />
    </div>
  );
}
