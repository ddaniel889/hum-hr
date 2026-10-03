import { ChartDataset } from "chart.js";
import { EmployeeFind } from "./employee-find.model";

export class Analytics {
  chartData: ChartDataset[];
  organizationalUnitId: number;
  labels: any[];
  total: number;
  period: string;
  chartType: string;
  employeeFind: EmployeeFind[];
  isAllSigned: boolean;
  containerTypeId: number;
  constructor() {
    this.chartData = [];
    this.labels = [];
  }
}
