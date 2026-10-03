export interface DocumentationTypeSet {
    id: number;
    name: string;
    description: string;
    documentationTypeSetItem: DocumentationTypeSetItem[];
    organizationalUnitId: number;
    enabled: boolean;
    disabledDateTime?: Date;
    metricsSet:any;
}

export interface DocumentationSetDetailFind {
      index: number;
      page: number;
      itemPerPage: number;
      isPaged: boolean;
      active?: boolean;
      searchField?: string;
      setId: number;
      organizationalUnitId:number;
      completeDocumentation: boolean;
      inCompleteDocumentation:boolean;
      withOutDocumentation:boolean;
      requiredDocumentation:boolean;
      norequiredDocumentation:boolean;
}

export interface DocumentationTypeSetFind {
  organizationalUnitId: number;
  searchField?: string;
  enabled?: boolean;
}

export interface DocumentationTypeSetItem {
    id?: number;
    documentationTypeId: number;
    metadataValue?: string;
    metadataSystemName?: string;
    metadataId?: string;
    order: number;
    usesCount: number;
    description: string;
    isFinished?: boolean;
    index?: number;
    documentationTypeSetItemFiles?: DocumentationTypeSetItemFile[];
    canAddDefaultFile?: boolean;
    required: boolean;
}

export interface DocumentationTypeSetItemFile {
    id: number;
    documentationTypeSetItemId: number;
    name: string;
    fileId: string;
}


