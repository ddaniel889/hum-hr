import { MetadataDefinition } from "./metadata.model";

export interface MetadataDocType extends MetadataDefinition {
  documentTypeId: number;
  id: number;
  isEnabled: boolean;
  fromBarcode: boolean;
  fromBarcodeStart: any;
  fromBarcodeLength: any;
  useCalendar: boolean;
  metadataFiledName: string;
  maskOptions: string;
  metadataOrganizationalUnitId: number;
  systemName: string;
  fromParent: boolean;
  importColumnName: string;
  organizationalUnitName: string;
  isSortable: boolean;
  metadataValue: any;
  metadataValueDescription: string;
}
