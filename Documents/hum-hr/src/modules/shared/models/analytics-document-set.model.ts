import { ChartDataset } from "chart.js";
import { AnalyticsDocumentSetPerson } from "./analytics-document-set-person.model";
import { EmployeeFind } from "./employee-find.model";

export class AnalyticsDocumentSet {
  organizationalUnitId: number;
  total: number;
  incomplete: number;
  complete: number;
  affectedPeople: number;
  people: AnalyticsDocumentSetPerson[];
  allpeople: AnalyticsDocumentSetPerson[];  
  constructor() {
    this.people = [];
  }
}
