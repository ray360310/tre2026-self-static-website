import { DataErrorState } from "./components/DataErrorState";
import { TabShell, type TabDefinition } from "./components/TabShell";
import { ConflictAnalysisTab } from "./features/conflict-analysis/ConflictAnalysisTab";
import { EventCatalogTab } from "./features/event-catalog/EventCatalogTab";
import { MyScheduleTab } from "./features/my-schedule/MyScheduleTab";
import { loadOfficialEventData, safeParseAppData } from "./lib/loadData";

export default function App() {
  const result = safeParseAppData();

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
  const tabs: TabDefinition[] = [
    {
      id: "my-schedule",
      label: "我的行程",
      heading: "已購活動",
      content: <MyScheduleTab data={data} />
    },
    {
      id: "conflict-analysis",
      label: "衝突分析",
      heading: "衝突總覽",
      content: <ConflictAnalysisTab data={data} />
    },
    {
      id: "event-catalog",
      label: "TRE2026 活動",
      heading: "活動總覽",
      content: <EventCatalogTab officialData={officialData} />
    }
  ];

  return <TabShell tabs={tabs} />;
}
