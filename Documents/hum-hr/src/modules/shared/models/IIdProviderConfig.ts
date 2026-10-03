export interface IIdProviderConfig {
  id: number;
  key: string;
  returnUrl: string;
  accessPoint: string;
  publicKey: string;
  organizationalUnitId: number;
  active: boolean;
  urlCallback?: string;
  applicationId?: number;
}

export interface IdProviderConfigPost extends IIdProviderConfig {
  applyToChildren: boolean;
}
