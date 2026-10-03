import { Injectable } from "@angular/core";
import { AppConfig } from "src/app/app.config";
import { HttpClient } from "@angular/common/http";
import { Employee } from "../models";
import { AddMetadataItem } from "../models/metadata.model";
import { FileDocumentMetadata } from "../models/file-document-metadata.model";
import { EmployeeMetadata } from "../models/employee-metadata.model";

@Injectable()
export class MetadataService {
  url = AppConfig.settings.apiUrls.edr;
  constructor(private http: HttpClient) { }

  getMetadataById(id: number) {
    return this.http.get<any>(`${this.url}/AdminMetadata/${id}`);
  }

  customMetadatasLD(metadatas: any[]) {
    return metadatas.filter(m => m.metadataSystemName != Employee.nroLegSystemName
      && m.metadataSystemName != Employee.nameSystemName
      && m.metadataSystemName != Employee.lastNameSystemName
      && m.metadataSystemName != Employee.cuilSystemName
      && m.metadataSystemName != Employee.mailSystemName
      && m.metadataSystemName != Employee.fechaActivoSystemName
      && m.metadataSystemName != Employee.fechaInactivoSystemName
      && m.metadataSystemName != Employee.userIdSystemName
      && m.metadataSystemName != Employee.estadoSystemName);
  }

  updateOptionValues(item: AddMetadataItem, metadatas: any, isUpdate = false) {
    const m = metadatas.find(z => z.metadataId == item.metadataId);
    if (isUpdate) {
      const val = m.optionValues.find(z => z.value == item.key);
      const index = m.optionValues.indexOf(val);
      m.optionValues.splice(index, 1);
    }
    if (m.metadataType == 'combo') {
      m?.optionValues.push({ value: item.key });
    } else {
      m?.optionValues.push({ value: item.key, description: item.description });

    }
  }

  map(source: EmployeeMetadata[]): FileDocumentMetadata[] {
    const result: FileDocumentMetadata[] = [];
    source.forEach(metaSource => {
      const item = new FileDocumentMetadata();
      item.systemName = metaSource.metadataSystemName;
      item.metadataValue = metaSource.metadataValue;
      item.metadataIsRequired = metaSource.isRequired;
      item.metadataLabel = metaSource.metadataLabel;
      result.push(item);
    });
    return result;

  }
}
