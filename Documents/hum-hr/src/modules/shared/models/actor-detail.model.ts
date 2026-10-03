import { AdjectiveRolesUser } from "./adjective-roles-user.model";
import { RoleFunction } from "./role-function.model";
import { RoleUserDetail } from '../../shared/models/role-user-detail.model';

export class ActorDetail {
    id?: number;
    userId: number;
    roles: RoleUserDetail[];
    firstName?: string;
    lastName?: string;
    mail?: string;
    nickName?: string;
    organizationalUnitId?: number;
    organizationalUnitName?: string;
    delegatedSystemId: string;
    filtersAvaliable: boolean;
    isSamlActive: boolean;
    lastLoginDate?: Date;
    creationDate?: Date;
    arrayDate?: Date[];
    locked?: boolean = false;
    selected?: boolean = false;
    enabled?: boolean;
    icon?: string;
}
