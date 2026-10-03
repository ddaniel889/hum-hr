import { SignBatchDocument } from "./sign-batch-document.model";

export class SignBatch {
  id: string;
  organizationalUnitId: number;
  loginId: number;
  description: string;
  creationDate: Date;
  documents: SignBatchDocument[];
  documentsCount: number;
  organizationalUnitName: string;

  constructor() { }
}
