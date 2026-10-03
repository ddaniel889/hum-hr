import { FileDocument } from "./file-document.model";
import { Employee } from "./Employee/employee.model";

export class documentFileSignaturesData {
  userId:number;
  proveDocumentId:number;
  signedDate: Date;
  userName:string;
  cuil:string;
  signedBy:string;
  showDocumentStateBottom: boolean;
  showDocumentState: boolean;
  showDocumentMetadata: boolean; 
  constructor(){};
}
