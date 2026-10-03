import { EmployeeMetadata } from "../employee-metadata.model";
import { KeyValuePair } from "../Generics/ikeyValuePair.model";
import { EmployeeFind } from "./employee-find.model.";
export interface employeeFindFilters {
    employeeFind?: EmployeeFind;
    activeAdvancedSearch?: boolean;
    hasLoginFilter?: boolean;
    hasNotLoginFilter?: boolean;
    inactiveEmployees?: boolean;
    columns?:  KeyValuePair<string, EmployeeMetadata>[] ;
    exportColumns?:KeyValuePair<string, EmployeeMetadata>[];
    previousOuID:Number;
}
