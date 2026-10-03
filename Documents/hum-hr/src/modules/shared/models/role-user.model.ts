import { AdjectiveRolesUser } from "./adjective-roles-user.model";

export class RoleUser {
    roleId: number;
    filterName: string;
    organizationalUnitId: number;
    adjectiveRolesUser: AdjectiveRolesUser[];
}
