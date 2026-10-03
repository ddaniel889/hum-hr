import { MetadataFind } from './metadata.model';
export interface LawbookFindParameters {
    selecteView: string;
    metadatas?: MetadataFind[];
    period?: string;
    organizationalUnitId?: number;
    index?: number;
    isPaged?: boolean;
    itemPerPage?: number;
    page?: number;
}
