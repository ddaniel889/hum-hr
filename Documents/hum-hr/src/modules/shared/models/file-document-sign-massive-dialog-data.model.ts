import { FileDocument } from "./file-document.model";

export class FileDocumentSignMassiveDialogData {
  organizationalUnitId: number;
  organizationalUnitName: string;
  documentationId: number;
  documentationName: string;
  documentationDate: Date;
  documents: FileDocument[];


  countDocuments() {
    if (!this.documents) {
      return 0;
    }
    return this.documents.length;
  }

  showDetails(): boolean {
    return this.countDocuments() > 0;
  }
  showDocumentation(): boolean {
    return !this.showDetails() && this.documentationId != null && this.documentationName != null;
  }
  showOu(): boolean {
    return !this.showDetails() && !this.showDocumentation()
      && this.organizationalUnitId != null
      && this.organizationalUnitName != null;
  }
}


