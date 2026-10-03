export interface IPwdReset {
    code: string;
    password: string;
    confirmPassword: string;
}

export interface IPwdChange {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}
