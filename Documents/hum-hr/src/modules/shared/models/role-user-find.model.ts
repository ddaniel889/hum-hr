export interface RoleUserFind {
    roleId: number;
    filterName: string;
    organizationalUnitIds: number[];
    enabled?: boolean;
}
