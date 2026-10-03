import { Component, OnInit } from '@angular/core';
import { RoleUserService } from '../../shared/services/role-user.service';
import { MessageService } from '../../shared/errorHandler/message.service';
import { OrganizationalUnit, ContainerType } from '../../shared/models';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { RoleUserFind } from '../../shared/models/role-user-find.model';
import { RoleUserDetail } from '../../shared/models/role-user-detail.model';
import { DocumentationType } from '../../shared/models/documentation-type.model';
import { DocumentationTypesService } from '../../shared/services/documentation-types.service';
import { ContainerTypeService } from '../../shared/services/container-type.service.';
import { RoleService } from '../../shared/services/role.service';
import { Role } from '../../shared/models/role.model';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-role-user-find',
  templateUrl: './role-user-find.component.html',
  styles: []
})
export class RoleUserFindComponent implements OnInit {
  roleUsers: RoleUserDetail[] = [];
  roleUserFind: RoleUserFind;
  selectedUser: RoleUserDetail;
  filterName: string;
  organizationalUnits: OrganizationalUnit[];
  selectedOrganizationalUnit: OrganizationalUnit;
  parentOu: OrganizationalUnit;
  loading = false;
  itemsCount: number;
  ouLoaded = false;
  showDetail = false;
  isEditing = false;
  documentationTypes: DocumentationType[];
  containerType: ContainerType;
  roles: Role[];
  noContainerType = false;
  enabledFilter = true;
  disabledFilter = false;
  filterLabel = 'Actores Habilitados';
  showSearchBar = false;
  showOus = false;

  constructor(
    private roleUserService: RoleUserService,
    private msjService: MessageService,
    private organizationalUnitService: OrganizationalUnitService,
    private containerTypeService: ContainerTypeService,
    private documentationTypesService: DocumentationTypesService,
    private roleService: RoleService,
    private userService: UserService
  ) {
  }

  ngOnInit() {
    this.loading = true;
    this.organizationalUnitService.getTreeInMemory()
      .then(ous => {
        this.organizationalUnits = ous.filter(o => o.isRoot === false);
        this.parentOu = ous.find(o => o.isRoot);
        if (this.organizationalUnitService.getCurrentOU() == null) {
          this.selectChildOu(this.organizationalUnits[0]);
          this.organizationalUnitService.setCurrentOU(this.organizationalUnits[0]);
        } else {
          // Si es root hacer otra cosa!
          const currentOu = this.organizationalUnitService.getCurrentOU();
          if (currentOu.isRoot) {
            this.selectRootOu();
          } else {
            this.selectChildOu(currentOu);
          }

          if (this.organizationalUnitService.getCurrentOU().isRoot) {
            this.parentOu.selected = true;
          } else {
            this.organizationalUnits.find(ou => ou.id === this.selectedOrganizationalUnit.id).selected = true;
          }
        }
        this.ouLoaded = true;
      },
        err => {
          this.loading = false;
          this.msjService.showError(err);
        }
      );
  }

  getDocumentationTypes(organizationalUnit: OrganizationalUnit) {
    this.documentationTypesService.get(organizationalUnit.id).toPromise().then(
      data => {
        this.documentationTypes = data;
      },
      err => this.msjService.showError(err)
    );
  }

  getContainerType(organizationalUnit: OrganizationalUnit) {
    this.containerTypeService
      .getContainerType(organizationalUnit.id.toString())
      .toPromise()
      .then(containerType => {
        this.containerType = containerType;
        this.loading = false;
      },
        err => {
          this.msjService.showError(err);
        }
      );
  }

  selectChildOu(ou: OrganizationalUnit) {
    this.loading = true;
    this.organizationalUnits.map(o => o.selected = false);
    if (this.parentOu) {
      this.parentOu.selected = false;
    }
    ou.selected = true;
    this.selectedOrganizationalUnit = ou;
    this.organizationalUnitService.setCurrentOU(this.selectedOrganizationalUnit);
    const loadings = [];
    loadings.push(this.containerTypeService.getContainerType(this.selectedOrganizationalUnit.id.toString()).toPromise());
    loadings.push(this.documentationTypesService.get(this.selectedOrganizationalUnit.id.toString()).toPromise());
    Promise.all(loadings)
      .then(res => {
        this.noContainerType = false;
        this.search();
      })
      .catch(err => {
        this.loading = false;
        if (err.code === "INTE009") {
          // Si no tiene legajo lo marco como sin legajo pero no tiro error.
          this.noContainerType = true;
        } else {
          this.msjService.showError(err);
        }
      });
  }

  selectRootOu() {
    this.organizationalUnits.map(o => o.selected = false);
    this.parentOu.selected = true;
    this.noContainerType = false;
    this.selectedOrganizationalUnit = this.parentOu;
    this.organizationalUnitService.setCurrentOU(this.selectedOrganizationalUnit);
    this.search();
  }

  closeDetail(refreshSearch: boolean) {
    this.showDetail = false;
    this.roleUsers.map(r => r.selected = false);
    //document.getElementsByClassName('scrollTo')[0].scrollIntoView({ block: "center", behavior: "smooth" });
    if (refreshSearch) {
      this.search();
    }
  }

  refreshItem(updatedRoleUser: RoleUserDetail) {
    // Actualizo el item
    const index = this.roleUsers.findIndex(r => r.id === updatedRoleUser.id);
    updatedRoleUser.selected = true;
    this.roleUsers[index] = updatedRoleUser;
  }

  filteredSearch() {
    if (this.enabledFilter && this.disabledFilter) {
      this.filterLabel = 'Todos los Actores';
    } else {
      this.filterLabel = this.enabledFilter ? 'Actores Habilitados' : 'Actores Deshabilitados';
    }

    this.search();
  }

  search() {
    this.loading = true;
    const ouIds: number[] = this.selectedOrganizationalUnit.parentOrganizationalUnitId ? [this.selectedOrganizationalUnit.id] : this.organizationalUnits.map(o => o.id);
    if (!this.selectedOrganizationalUnit.parentOrganizationalUnitId) {
      ouIds.push(this.parentOu.id);
    }

    this.roleUserFind = {
      filterName: this.filterName,
      organizationalUnitIds: ouIds,
      roleId: undefined,
      enabled: (this.enabledFilter && this.disabledFilter) || (!this.enabledFilter && !this.disabledFilter) ? null : this.enabledFilter
    };
    this.roleUserService.find(this.roleUserFind).toPromise()
      .then(
        res => {
          this.loading = false;
          this.roleUsers = res;
          if (!this.roleUserFind.filterName || this.roleUserFind.filterName.length < 1) {
            this.showSearchBar = this.roleUsers.length > 9;
          }
        },
        err => {
          this.loading = false;
          this.msjService.showError(err);
        }
      );
  }

  selectRoleUser(user: RoleUserDetail) {
    this.roleUsers.map(r => r.selected = false);
    user.selected = true;
    this.showDetail = true;
    this.selectedUser = user;
    this.getRoles();
    //document.getElementsByClassName('scrollTo')[0].scrollIntoView({ block: "center", behavior: "smooth" });
    this.loading = false;
  }

  getRoles() {
    const parentOuId = this.selectedOrganizationalUnit.isRoot ? this.selectedOrganizationalUnit.id : this.selectedOrganizationalUnit.parentOrganizationalUnitId;
    this.roleService.getByFunctions(['OVERSEER'], parentOuId).toPromise()
      .then(res => {
        this.roles = res;
      },
        err => this.msjService.showError(err)
      );
  }

  OnAddClosed(shouldRefresh: boolean) {
    this.isEditing = false;

    if (shouldRefresh) {
      this.search();
    }
  }

  toggleOus() {
    this.showOus = true;
    this.showDetail = false;
    this.isEditing = false;
  }

  closeOus() {
    this.showOus = false;
  }

}
