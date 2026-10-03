import { KeyValuePair } from "./Generics/ikeyValuePair.model";
import { LeaveRequestFind } from "./leave-request-find.model";



export interface leaveFindFilters {
    leaveRequestFind?: LeaveRequestFind;
    columns?:  KeyValuePair<string, string>[] ;
    exportColumns?:KeyValuePair<string, string>[];
    previousOuID:Number;
}