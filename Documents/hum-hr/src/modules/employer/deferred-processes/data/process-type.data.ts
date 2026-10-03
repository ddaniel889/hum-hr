import { ProcessOrchestratorType as ProcessType } from "../models/deferred-processes.model";

export const processOrchestatorTypeMap: { [key in ProcessType]: string } = {
  [ProcessType.AutomaticUpdateSetMetrics]: "Actualización de métricas de Set",
  [ProcessType.CandidateImport]: "Importación de candidatos",
  [ProcessType.EmployeeImport]: "Importación de empleados",
  [ProcessType.PurgeEngineInstances]: "Depuración de instancias del motor de orquestación",
  [ProcessType.UpdateSetMetrics]: "Actualización de métricas de Set",
  [ProcessType.UploadingDocumentationAutomaticIdentification]: "Carga de documentación con identificación automática",
  [ProcessType.DeleteDocumentsByProcessId]: "Proceso de borrado",
  [ProcessType.ReprocessDocumentsByProcessId]: "Proceso de reprocesamiento",
  [ProcessType.CustomerDataUpdate]: "Proceso de modificación de datos de cliente",
  [ProcessType.NotValidType]: "Tipo no válido",
  [ProcessType.ProcessOrchestratorMetrics]: "Métricas asociadas a orquestación",
  [ProcessType.ProcessOrchestratorMedic]: "Orquestación de procesos médica",
};

export const processOrchestatorTypeChoices: {
  id: ProcessType;
  name: string;
}[] = [ProcessType.UploadingDocumentationAutomaticIdentification].map(
  (key) => ({
    id: key,
    name: processOrchestatorTypeMap[key],
  })
);
