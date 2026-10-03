import { SegmentEmployeeFind } from "../segment-employee-find.model";
import { EmployeeFind } from "../employee-find.model";

export interface AdvancedEmployeeFilters {
  selectedEmployeeFind: EmployeeFind[];
  segmentSearch: boolean;
  nroLegSearch: string;
  cuilSearch: string;
  inactiveSearch: boolean;
  activeSearch: boolean;
}
