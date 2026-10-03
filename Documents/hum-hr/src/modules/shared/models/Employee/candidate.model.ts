import { Person } from "./person.model";
import { DocumentStatistic } from "../../services/file-document.service";
import { ContainerType } from "..";

export class Candidate extends Person {
  public static readonly startDateSystemName = "_fecProbIng";

  actions: any[];
  documentStateProgress?: DocumentStatistic;

  constructor() {
    super();
    this.fixedMedatadas = [
      { key: 1, value: Candidate.cuilSystemName },
      { key: 2, value: Candidate.nameSystemName },
      { key: 3, value: Candidate.lastNameSystemName },
      { key: 4, value: Candidate.startDateSystemName },
      { key: 5, value: Candidate.estadoSystemName },
      { key: 6, value: Candidate.userIdSystemName },
      { key: 7, value: Candidate.mailSystemName }
    ];
    this.excludedMetadatasFromAdd = [
      Candidate.estadoSystemName,
      Candidate.userIdSystemName
    ];
  }

  get startDate(): string {
    return this.getMetadataValue(Candidate.startDateSystemName);
  }
  set startDate(value: string) {
    this.setMetadataValue(Candidate.startDateSystemName, value);
  }

  get startDateSystemName(): string {
    return 'm.' + Candidate.startDateSystemName;
  }

  get isActive(): boolean {
    return this.state != 'Inactivo';
  }

  public getEmployeeClass() {
    return this.isActive ? '' : 'disabled';
  }

  getDocumentationHeadersExports(containerType: ContainerType): any[] {
    const headers = [];

    headers.push({
      key: Candidate.lastNameSystemName,
      value: {
        metadataLabel: "Apellido",
        metadataType: "text"
      }
    });

    headers.push({
      key: Candidate.nameSystemName,
      value: {
        metadataLabel: "Nombre",
        metadataType: "text"
      }
    });

    headers.push({
      key: Candidate.startDateSystemName,
      value: {
        metadataLabel: "Fecha de ingreso",
        metadataType: "date"
      }
    });

    headers.push({
      key: Candidate.cuilSystemName,
      value: {
        metadataLabel: containerType.label,
        metadataType: "text",
        metadataMask: containerType.mask
      }
    });

    return headers;
  }

  getDocumentationHeaders(containerType: ContainerType): any[] {
    const headers = [
      { prop: Candidate.lastNameSystemName, name: 'Apellido', sortable: true },
      { prop: Candidate.nameSystemName, name: 'Nombre', sortable: true },
      { prop: Candidate.cuilSystemName, name: containerType.label, sortable: true, mask: containerType.mask },
      { prop: Candidate.startDateSystemName, name: 'Fecha de ingreso', sortable: true, dir: 'asc', cellTemplate: 'dateColumn' },
      { prop: 'setConfigurated', name: 'Set', sortable: false, cellTemplate: 'setConfigurated' },
      { prop: 'documentStateProgress', name: 'Avance de Documentación', sortable: false, cellTemplate: 'statusColumn' },
      { prop: 'Actions', name: 'Acciones', sortable: false, cellTemplate: 'actionsColumn' }
    ];

    return headers;
  }
}
