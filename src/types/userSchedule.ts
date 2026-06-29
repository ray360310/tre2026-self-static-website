export interface PurchasedScheduleEntry {
  id: string;
  sourceType: "official";
  officialEventId: string;
  officialEventTitle: string;
  selectionLabel: string;
  date: string;
  start: string;
  end: string;
  vendorName: string | null;
  peopleNames: string[];
  notes: string | null;
  sourceUrl: string;
}

export interface UserScheduleRecord {
  version: 1;
  purchasedEntries: PurchasedScheduleEntry[];
  updatedAt: string | null;
}
