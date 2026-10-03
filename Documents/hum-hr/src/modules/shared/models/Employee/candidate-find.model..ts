import { Candidate } from "./candidate.model";

export interface CandidateFind {
  organizationUnitIds?: number[];
  containerTypeId: number;
  cuil?: string;
  nroLegajo?: string;
  name?: string;
  orderBy?: string[];
  orderAscendent?: boolean;
  index?: number;
  isPaged?: boolean;
  itemPerPage?: number;
  page?: number;
  active?: boolean;
  userid?: Number;
  id?: number;
  inactive?: boolean;
  withDocuments?: boolean;
}

export interface CandidateExport extends CandidateFind {
  sheetName: string;
  selectedCandidates: Candidate[];
  headers: any[];
  isCandidate: boolean;
}
