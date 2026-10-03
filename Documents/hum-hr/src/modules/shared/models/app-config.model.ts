export interface IAppConfig {
    application: {
        code: string;
        id: string;
        maxFileDocumentAttachment: string;
        subdomain: string;
        formStage: string;
        minAccessValue:number;
        minOuLogins:number;
        noveltiesDayRange:number;
        useClickjackingProteccion: boolean;
        quickFoodOuId:string;
        quickFoodMetaSysName:string;
        quickFoodMetaValue:string;
        countProcessMassiveSign:number;
        countProcessMassiveGroupSign:number;
    };

    apiUrls: {
        auth: string;
        wf: string;
        audit: string;
        cpp: string;
        edr: string;
        process: string;
        notif: string;
    };

    custom: {
        cpp2016: string;
        cpp2016AppId: string;
        employeeHelpUrl: string;
        employerHelpUrl: string;
        customerCareUrl: string;
        registerHelpUrl: string;
        edr: string;
        arandanos: string;
        cifUrl: string;
        husignerDownloadUrl: string;
        ReCaptchaSiteKey: string;
    };

    microfrontends: {
        dashboard: string;
        humanageConnect?: string;
    }

    webTwain: {
        key: string;
        isTrial: string;
        ResourcesPath: string;
    };

    googleAnalyticsKey: string;
    releaseName: string;
}
