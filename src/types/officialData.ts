export interface OfficialPersonRecord {
  id: string;
  name: string;
  image: string | null;
  sourceUrl: string | null;
}

export interface OfficialEventRecord {
  id: string;
  title: string;
  bannerImageUrl: string | null;
  detailImageUrls: string[];
  sourceUrl: string;
  vendorName: string | null;
  actressNames: string[];
  priceTags: string[];
  fullContent: string;
}

export interface OfficialEventData {
  events: OfficialEventRecord[];
  people: OfficialPersonRecord[];
  peopleById: Record<string, OfficialPersonRecord>;
}
