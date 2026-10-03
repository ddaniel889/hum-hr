export interface ICertificatePwdRequest {
    token: string;
    password: string;
    repeatPassword: string;
    withLogin: boolean;
}
