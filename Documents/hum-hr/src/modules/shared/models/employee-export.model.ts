import { EmployeeFind, Employee } from ".";

export interface EmployeeExport extends EmployeeFind {
  sheetName: string;
  selectedEmployees: Employee[];
  headers: any[];
  includeLeavesBalance: boolean;
}
