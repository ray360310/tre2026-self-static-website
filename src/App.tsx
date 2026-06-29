import { useState } from "react";

import { DataErrorState } from "./components/DataErrorState";
import { TabShell, type TabDefinition } from "./components/TabShell";
import { ConflictAnalysisTab } from "./features/conflict-analysis/ConflictAnalysisTab";
import { EventCatalogTab } from "./features/event-catalog/EventCatalogTab";
import { MyScheduleTab } from "./features/my-schedule/MyScheduleTab";
import { loadOfficialEventData, safeParseAppData } from "./lib/loadData";
import {
  addPurchasedEntry,
  loadUserSchedule,
  removePurchasedEntry,
  saveUserSchedule
} from "./lib/userScheduleStorage";
import type { PurchasedScheduleEntry } from "./types/userSchedule";

export default function App() {
  const result = safeParseAppData();
  const [schedule, setSchedule] = useState(() => loadUserSchedule());

  if (!result.ok) {
    return <DataErrorState errors={result.errors} />;
  }

  let officialData;

  try {
    officialData = loadOfficialEventData();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown official data error";

    return <DataErrorState errors={[message]} />;
  }

  const { data } = result;

  const handleAddPurchasedEntry = (entry: PurchasedScheduleEntry) => {
    setSchedule((current) => {
      const next = addPurchasedEntry(current, entry);
      saveUserSchedule(next);
      return next;
    });
  };

  const handleRemovePurchasedEntry = (entryId: string) => {
    setSchedule((current) => {
      const next = removePurchasedEntry(current, entryId);
      saveUserSchedule(next);
      return next;
    });
  };

  const tabs: TabDefinition[] = [
    {
      id: "my-schedule",
      label: "我的行程",
      heading: "已購活動",
      content: (
        <MyScheduleTab
          officialData={officialData}
          schedule={schedule}
          onRemovePurchasedEntry={handleRemovePurchasedEntry}
        />
      )
    },
    {
      id: "conflict-analysis",
      label: "衝突分析",
      heading: "衝突總覽",
      content: (
        <ConflictAnalysisTab
          data={data}
          schedule={schedule}
          officialData={officialData}
        />
      )
    },
    {
      id: "event-catalog",
      label: "TRE2026 活動",
      heading: "活動總覽",
      content: (
        <EventCatalogTab
          officialData={officialData}
          schedule={schedule}
          onAddPurchasedEntry={handleAddPurchasedEntry}
          onRemovePurchasedEntry={handleRemovePurchasedEntry}
        />
      )
    }
  ];

  return <TabShell tabs={tabs} />;
}
