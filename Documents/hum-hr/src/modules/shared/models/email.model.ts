import { AppConfig } from "src/app/app.config";

export enum WelcomeEmail {
    Pending = 0,
    NeverLoggedIn = 1
}

export class WelcomeParametersDTO {
    organizationalUnitId?: number;
    userId?: number;
    applicationId: string;
    url: string;
    isCandidate: boolean;
    OptionEmail: WelcomeEmail;

    constructor() {
        this.applicationId = AppConfig.settings.application.id;
        this.url = `${location.origin}/#/pwd-first-time/{0}`;
        this.isCandidate = false;
        this.OptionEmail = WelcomeEmail.Pending;
    }
}

export class OUEmailConfigDTO {
    id?: number
    organizationalUnitId: number;
    productName: string;
    signature: string;
    imgLogo: string;
    imgBkg: string;
}
