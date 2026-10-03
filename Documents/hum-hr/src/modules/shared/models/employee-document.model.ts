import { MetadataDocType } from "./MetadataDocType.model";
import { DocumentationType } from "./documentation-type.model";

export interface EmployeeDocument {
  containerTypeId: number;
  organizationalUnitId: number;
  metadatas: MetadataDocType[];
  documentationTypeSelected: DocumentationType;
  documentContainerId: number;
  formioSubmissinoId: string;
  formioFormAlias: string;
}
