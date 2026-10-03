import { ChartDataset } from "chart.js";
import { AnalyticsDocumentSetItem } from "./analytics-document-set-item";
import { EmployeeFind } from "./employee-find.model";

export class AnalyticsDocumentSetPerson {
  organizationalUnitId: number;
  firstName: string;
  lastName: string;
  mail: string;
  cuil: string;
  percentage: number;
  finishedDocuments: number;
  totalDocuments: number;
  userId: string;
  documents: AnalyticsDocumentSetItem[];
  selected:boolean;
  disabled:boolean;
  constructor() {}
}
