import { EmployeeFind } from './Employee/employee-find.model.';
import { FileDocument } from './file-document.model';
export interface FileDocumentSendToAll {
    employeeFilter: EmployeeFind;
    document: FileDocument;
}