export class OrganizationalUnitAccessConfig {
    id?: number;
    organizationalUnitId: number;
    canEditProfile: boolean;
    isCandidate: boolean;
    canEditPersonalInformation?: boolean;
    canEditFullName?: boolean;
    canEditEmail?: boolean;
    canEditUserName?: boolean;
    canEditAvatar?: boolean;
    canEditSignature?: boolean;
    canEditPhoneNumber?:boolean;

    constructor() {
        this.canEditProfile = true;
        this.canEditPersonalInformation = true;
        this.canEditFullName = true;
        this.canEditEmail = true;
        this.canEditUserName = true;
        this.canEditAvatar = true;
        this.canEditSignature = true;
        this.canEditPhoneNumber = true;
    }
}
