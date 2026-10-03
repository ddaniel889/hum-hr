import { DeferedProcessStateHistory } from "./defered-process-state-history.model";
import { DocumentationType } from "./documentation-type.model";

export class DeferedProcess {
  id: string;
  creationDate: Date;
  createdByUserName: string;
  stateId: string;
  stateName: string;
  processTypeId: string;
  processTypeName: string;
  priority: Number;
  organizationalUnitId: string;
  organizationalUnitName: string;
  total: Number;
  history: DeferedProcessStateHistory[];
  data: any;
  files: any[];
  hasErrors: Boolean;
  OUNameDestination: string;
  organizationalUnitIdDestination: any;
  documentationType: DocumentationType;
  zipBase64: string;
  isPurged: Boolean;
  purgedDate: Date;
  personType: string;
  constructor() {
    this.data = {};
    this.history = [];
  }

  public addParameterData(key: string, value: any) {
    if (!this.data?.parameters) {
      this.data.parameters = [];
    }

    this.data.parameters.push({
      [key]: value
    });
  }

  public stateClass() {
    switch (this.stateName) {
      case "finished":
        if (this.hasErrors) {
          return 'error-process-inbox';
        } else {
          return "finished-process-inbox";
        }
      case "limbo":
        return "limbo-process-inbox";
      case "in progress":
        return "in-process-inbox";
      case "deleted":
        return "erased-process-inbox";
      case "inDeleted":
        return "erased-process-inbox";
      default:
        return 'in-process-inbox';
    }
  }


}

export enum ProcessType {
  ALTA_EMPLEADO = "002",
  ALTA_DOCUMENTACION = "003",
  ALTA_DOCUMENTACION_IDENTIFICACION_AUTOMATICA = "004",
  ALTA_CANDIDATO = "010",
  ALTA_RECIBOS_FIRMADOS_HUSIGNERPRO = "013",
  FIRMA_DOCUMENTOS_HUSIGNERPRO = "014"
}
