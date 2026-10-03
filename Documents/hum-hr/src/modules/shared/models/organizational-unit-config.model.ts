import { Metadata } from "./metadata.model";

export class OrganizationalUnitConfig {
  organizationalUnitId: number;
  organizationalUnitName: string;
  configName: string;
  isRoot: boolean;
  metadataValues: Metadata[];

  constructor(
    organizationalUnitId: number,
    organizationalUnitName: string,
    configName?: string,
    isRoot?: boolean,
    metadataValues?: Array<any>) {
    this.organizationalUnitId = organizationalUnitId;
    this.organizationalUnitName = organizationalUnitName;
    this.configName = configName;
    this.isRoot = isRoot;
    this.metadataValues = [];

    if (metadataValues && metadataValues.length > 0) {
      metadataValues.forEach(m => this.setMetadata(m.name, m.systemName, m.value));
    }
  }

  get showMotiveDisagreement(): boolean {
    const mdis = this.getMetadata("#PaycheckMotiveDisagreement");
    return mdis && (mdis.value === 'true' || mdis.value === "true");
  }

  getMetadata(key: string): Metadata {
    if (!this.metadataValues) {
      return null;
    }

    const mvalues = this.metadataValues.filter(
      mv => mv.systemName === key || mv.name === key
    );

    if (mvalues.length > 0) {
      return mvalues[0];
    }

    return null;
  }

  setMetadata(name: string, key: string, value: string) {
    let metadata = this.getMetadata(key);

    if (metadata != null) {
      metadata.value = value;
    } else {
      metadata = {
        name: name,
        description: null,
        systemName: key,
        value: value
      };

      this.metadataValues.push(metadata);
    }
  }
}
