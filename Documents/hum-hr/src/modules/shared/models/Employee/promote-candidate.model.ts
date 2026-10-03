import { DocumentStatistic } from '../../services/file-document.service';
import { EmployeeMetadata } from '../employee-metadata.model';
export class PromoteCandidate {
  id: number;
  containerTypeId: number;
  delegatedSystemId: string;
  metadatas: EmployeeMetadata[];
  DocumentStatistics?: DocumentStatistic;

  constructor(id?: number, containerTypeId?: number) {
    if (id) {
      this.id = id;
    }

    if (containerTypeId) {
      this.containerTypeId = containerTypeId;
    }

    this.metadatas = [];
  }

  public setMetadataValue(systemName: string, value: any) {
    const metadata = this.getMetadata(systemName);
    if (metadata) {
      metadata.metadataValue = value;
    } else {
      this.metadatas.push(new EmployeeMetadata(systemName, value));
    }
  }

  protected getMetadata(key: string): EmployeeMetadata {
    if (!this.metadatas) {
      return null;
    }

    let mvalues = this.metadatas.filter(
      employeeFile => employeeFile.metadataSystemName === key
    );

    if (!mvalues) {
      mvalues = this.metadatas.filter(
        employeeFile => employeeFile.legSystemName === key
      );
    }

    if (mvalues.length > 0) {
      return mvalues[0];
    }

    return null;
  }
}
