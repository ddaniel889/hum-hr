import { CertificateProvider } from "./certificate-provider.model";

export class SignatureType {
    id: number;
    organizationalUnitId: number;
    certificateTypeId: number;
    certificateProviderId: number;
    isManualDeclaration: boolean;
    isAutomaticDeclaration: boolean;
    isEnabled: boolean;
    ouConfigSignaturePorts: SignaturePorts;
    certificateProvider: CertificateProvider;
    massiveSignatureAction: string;
    hasIntegratedHusigner: boolean = false ;

    constructor() { }
}

export class SignaturePorts {
    httpsFrom: number;
    httpsTo: number;
    httpFrom: number;
    httpTo: number;
    constructor() { }
}


export interface OuConfigSignatureTypeParametersDTO {
    organizationalUnitId?: number;
    CertificateTypeId?: number;
    IsManualDeclaration?: boolean;
    IsAutomaticDeclaration?: boolean;
    certificateProviderId?: number;
    IsEnabled?: boolean;
}
