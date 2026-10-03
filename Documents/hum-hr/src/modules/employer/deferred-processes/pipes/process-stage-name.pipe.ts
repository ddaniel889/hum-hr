import { Pipe, PipeTransform } from "@angular/core";
import {
  OngoingProcessOrchestrationDto,
  ProcessOrchestratorType,
} from "../models/deferred-processes.model";

type StagesName = { [code: string]: { es: string; en: string } };

const stageNamesMap: {
  [type in ProcessOrchestratorType]: StagesName;
} = {
  [ProcessOrchestratorType.AutomaticUpdateSetMetrics]: null,
  [ProcessOrchestratorType.CandidateImport]: null,
  [ProcessOrchestratorType.EmployeeImport]: null,
  [ProcessOrchestratorType.PurgeEngineInstances]: null,
  [ProcessOrchestratorType.UpdateSetMetrics]: null,
  [ProcessOrchestratorType.UploadingDocumentationAutomaticIdentification]: {
    "001": {
      en: "Counting Pages",
      es: "Contando páginas",
    },
    "002": {
      en: "Identifying",
      es: "Identificando",
    },
    "003": {
      en: "Merge Split Pdf files in individual documents",
      es: "Creando documentos",
    },
    "004": {
      en: "Fetching data for Employees",
      es: "Obteniendo datos de Empleados",
    },
    "005": {
      en: "Uploading documents",
      es: "Subiendo documentos",
    },
    "006": {
      en: "Validation and Verification",
      es: "Validacion y Verificación",
    },
    "DELETE": {
      en: "Deletion process",
      es: "Proceso de borrado",
    },
    "REPROCESS": {
      en: "Reprocessing",
      es: "Reprocesando",
    },
    "SUMMARY": {
      en: "Process completed",
      es: "Proceso finalizado",
    },
  },
  [ProcessOrchestratorType.DeleteDocumentsByProcessId]: {
    "001": {
      en: "Counting documents to delete",
      es: "Contando documentos para borrar",
    },
    "002": {
      en: "Deleting",
      es: "Borrando",
    },
    "SUMMARY": {
      en: "Process completed",
      es: "Proceso finalizado",
    },
  },
  [ProcessOrchestratorType.ReprocessDocumentsByProcessId]: {
    "001": {
      en: "Fetching data for Employees",
      es: "Obteniendo datos de Empleados",
    },
    "002": {
     en: "Counting documents to reprocess",
      es: "Contando documentos para reprocesar",
    },
    "003": {
      en: "Reprocessing",
      es: "Reprocesando",
    },
    "SUMMARY": {
      en: "Process completed",
      es: "Proceso finalizado",
    },
  },
  [ProcessOrchestratorType.CustomerDataUpdate]: null,
  [ProcessOrchestratorType.NotValidType]: null,
  [ProcessOrchestratorType.ProcessOrchestratorMetrics]: null,
  [ProcessOrchestratorType.ProcessOrchestratorMedic]: null,
};
@Pipe({
  name: "processStageName",
})
export class ProcessStageNamePipe implements PipeTransform {
  transform(
    stageCode: string,
    processType: ProcessOrchestratorType,
    fallbackStageName: string = "Procesando"
  ): string {
    if (!stageCode || !processType) {
      return fallbackStageName;
    }

    const codesMap = stageNamesMap[processType];
    if (!codesMap) {
      return fallbackStageName;
    }

    const processNameList = codesMap[stageCode];
    const processName = processNameList ? processNameList.es : fallbackStageName;
    return processName;
  }
}
