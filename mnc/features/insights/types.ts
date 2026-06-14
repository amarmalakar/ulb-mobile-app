export type InsightType = 'NEWS' | 'EVENT' | 'TENDERS' | 'JOBS' | 'OTHER';
export type InsightStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type InsightVisibleTo = 'STAFF' | 'USER';
export type InsightLocaleJson = Record<string, string>;

export type V2InsightItem = {
  id: string;
  type: InsightType;
  status: InsightStatus;
  visibleTo: InsightVisibleTo[];
  title: InsightLocaleJson;
  subTitle: InsightLocaleJson | null;
  description: InsightLocaleJson | null;
  displayTitle: string;
  displaySubTitle: string;
  images: string[];
  fileUrl: string[];
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GetV2InsightsResponse = {
  ok: true;
  data: {
    items: V2InsightItem[];
  };
};
