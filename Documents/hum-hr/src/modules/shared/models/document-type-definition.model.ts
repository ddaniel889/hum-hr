import { MetadataDefinition } from "./metadata.model";

export interface DocumentTypeDefinition {
    id: number;
    name: string;
    systemName: string;
    organizationalUnitId: number;
    organizationalUnitName: string;
    metadata: MetadataDefinition[];
}