export interface Certificate {
    id: Number;
    expirationDate: Date;
    enabled: Boolean;
    provider: String;
    providerId: String;
    providerDescription: string;
    requirePassword: Boolean;
    supportDisagreement: Boolean;
    isPending: Boolean;
    massiveSignatureAction: String;
    singleSignatureAction: String;
    type: String;
    typeId: CertificateType;
    organizationalUnitName: String;
    organizationalUnitDescription: String;
    organizationalUnitId: number;
    lastUseDate?: Date;
}

export enum CertificateType {
    Employee = 0,
    Employer = 1,
}
