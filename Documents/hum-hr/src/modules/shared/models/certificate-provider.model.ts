export interface CertificateProvider {
  id: number;
  name: string;
  singleSignatureAction: string;
  massiveSignatureAction: string;
  requirePassword: boolean;
  requiredOU: boolean;
  appCertificate: boolean;
  askExpirationDate: boolean;
  description: string;
  isEmployeeEnabled: boolean;
  isRRHHEnabled: boolean;
}

export enum Providers {
  Encode = 1,
  Nacion = 2,
  Token = 3,
  Clave = 4,
  CardinalClaveLogin = 5,
  CardinalClaveRoja = 6
}