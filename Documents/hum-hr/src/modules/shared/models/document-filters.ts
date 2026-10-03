import { ContainerTypeMetadata } from "./container-type.metadata.model";
import { EmployeeDocumentFileSearch } from "./employee-document-file-search";
import { AdvancedEmployeeFilters } from "./Employee/advanced-employee-filters";
import { KeyValuePair } from "./Generics/ikeyValuePair.model";


export interface DocumentFilters {
    documentFilters?: EmployeeDocumentFileSearch;
    columns?: KeyValuePair<string, ContainerTypeMetadata>[];
    exportColumns?: KeyValuePair<string, ContainerTypeMetadata>[];
    availableColumns: KeyValuePair<any, ContainerTypeMetadata>[];
    columnsClass: string;
    isCanceledFilter: boolean;
    isNotCanceledFilter: boolean;
    isFinishedFilter:boolean;
    isNotFinishedFilter:boolean;
    previousOuID:Number;
    advancedEmployeeFilters:AdvancedEmployeeFilters;
    restrictionFilter:number;
}