import { IdName } from './Generics/IdName.model';

export class SegmentEmployeeFind implements IdName {
    id: any;
    name: string;
    systemName: string;

    constructor(id: any, name: string, systemName: string) {
        this.id = id;
        this.name = name;
        this.systemName = systemName;
    }
}
