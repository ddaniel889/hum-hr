export class OrganizationalUnitImages {
    id: number;
    isLogo: boolean;
    base64File: string;
    organizationalUnitId: number
    theme: string;

    constructor(id: number, isLogo: boolean, base64File: string, theme: string, organizationalUnitId:number) {
        this.id = id;
        this.isLogo = isLogo;
        this.base64File = base64File;
        this.theme = theme;
        this.organizationalUnitId = organizationalUnitId;
    }

    getLogoData() {
        return this.isLogo ? 'data:image/jpeg;base64,' + this.base64File : '';
    }

    getImageData(){
      return !this.isLogo ? 'data:image/jpeg;base64,' + this.base64File : '';
    }
}
