import { AdjectiveRolesUser } from "./adjective-roles-user.model";
import { RoleFunction } from "./role-function.model";

export class RoleUserDetail {
    id: number;
    adjectiveRolesUser: AdjectiveRolesUser[];
    firstName: string;
    functions: RoleFunction[];
    lastName: string;
    mail: string;
    nickName: string;
    delegatedSystemId: string;
    organizationalUnitId: number;
    organizationalUnitName: string;
    roleId: number;
    roleName: string;
    userId: number;
    selected: boolean;
    icon: string;
    documentationTypes: string[] = [];
    filters: any[] = [];
    creationDate: Date;
    lastLoginDate: Date;
    enabled?: boolean;
    locked: boolean;
    filtersAvaliable: boolean;
    isSamlActive: boolean;
    toggleState?: boolean;
}
