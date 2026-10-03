export interface ProcessResultItemFind {
    processId?: string;
    itemsPerPage: number;
    orderBy: string;
    page: number;
    sortOrder: number;
    searchValue: string;
    onlyErrors: boolean;
}
