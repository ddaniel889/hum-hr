import { Component, OnInit } from '@angular/core';
import { RoleUserService } from '../../shared/services/role-user.service';
import { MessageService } from '../../shared/errorHandler/message.service';
import { OrganizationalUnit, ContainerType } from '../../shared/models';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { RoleUserFind } from '../../shared/models/role-user-find.model';
import { RoleUserDetail } from '../../shared/models/role-user-detail.model';
import { ActorDetail } from '../../shared/models/actor-detail.model';
import { DocumentationType } from '../../shared/models/documentation-type.model';
import { DocumentationTypesService } from '../../shared/services/documentation-types.service';
import { ContainerTypeService } from '../../shared/services/container-type.service.';
import { RoleService } from '../../shared/services/role.service';
import { Role } from '../../shared/models/role.model';

@Component({
  selector: 'app-actor-find',
  templateUrl: './actor-find.component.html',
  styles: []
})
export class ActorFindComponent implements OnInit {
  roleUsers: RoleUserDetail[] = [];
  actors: ActorDetail[] = [];
  roleUserFind: RoleUserFind;
  selectedActor: ActorDetail;
  filterName: string;
  organizationalUnits: OrganizationalUnit[];
  selectedOrganizationalUnit: OrganizationalUnit;
  parentOu: OrganizationalUnit;
  loading = false;
  itemsCount: number;
  ouLoaded = false;
  showDetail = false;
  isEditing = false;
  isNew = false;
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
    private roleService: RoleService
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
    this.organizationalUnits.forEach(o => o.selected = false);
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
    this.organizationalUnits.forEach(o => o.selected = false);
    this.parentOu.selected = true;
    this.noContainerType = false;
    this.selectedOrganizationalUnit = this.parentOu;
    this.organizationalUnitService.setCurrentOU(this.selectedOrganizationalUnit);
    this.search();
  }

  closeDetail(refreshSearch: boolean) {
    this.showDetail = false;
    this.selectedActor = null;
    this.roleUsers.forEach(r => r.selected = false);
    if (refreshSearch) {
      this.search();
    }
  }

  refreshItem(updatedActor: ActorDetail) {
    // Actualizo el item
    const index = this.actors.findIndex(r => r.userId === updatedActor.userId);
    updatedActor.selected = true;
    this.actors[index] = updatedActor;
  }

  changeCardState(refreshItems: boolean) {
    this.isNew = false;
    if(refreshItems)this.search()
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
      enabled: null
    };
    // generamos los actores a partir de los roles obtenidos
    this.roleUserService.find(this.roleUserFind).toPromise()
      .then(
        res => {
          this.actors = this.getActores(res)
          if(this.enabledFilter && !this.disabledFilter) this.actors = this.actors.filter(a => a.enabled) 
          if(!this.enabledFilter && this.disabledFilter) this.actors = this.actors.filter(a => !a.enabled)
          if (!this.roleUserFind.filterName || this.roleUserFind.filterName.length < 1) this.showSearchBar = this.actors.length > 9
          this.loading = false;
        },
        err => {
          this.loading = false;
          this.msjService.showError(err);
        }
      );
  }

  selectActor(actor: ActorDetail) {
    this.actors.forEach(r => r.selected = false);
    actor.selected = true;
    this.showDetail = true;
    this.selectedActor = actor;
    this.getRoles();
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
    
    if (shouldRefresh){
      this.isNew = true;
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

  private getActores(roles): ActorDetail[] {
    const rolesByUser : RoleUserDetail[]  = this.groupByUserId(roles)  
    const actors : ActorDetail[] = Object.keys(rolesByUser).map(key => ({
      userId: parseInt(key),
      firstName: rolesByUser[key][0]?.firstName,
      lastName: rolesByUser[key][0]?.lastName,
      nickName: rolesByUser[key][0]?.nickName,
      mail: rolesByUser[key][0]?.mail,
      roles: rolesByUser[key].sort((a, b) => a.roleName.localeCompare(b.roleName, undefined, { sensitivity: 'base' })),
      organizationalUnitId: rolesByUser[key][0]?.organizationalUnitId,
      organizationalUnitName: rolesByUser[key][0]?.organizationalUnitName,
      filtersAvaliable: rolesByUser[key].some(r => r.filtersAvaliable),
      icon: rolesByUser[key].length > 1 ? 'fa-asterisk' : rolesByUser[key][0]?.icon,
      creationDate: rolesByUser[key][0]?.creationDate,
      lastLoginDate: rolesByUser[key][0]?.lastLoginDate,
      isSamlActive: rolesByUser[key][0]?.isSamlActive,
      delegatedSystemId: rolesByUser[key][0]?.delegatedSystemId,
      enabled: rolesByUser[key].some(x => x.enabled),
      locked: rolesByUser[key].some(x => x.locked) 
    }))
    .sort((a, b) => a.firstName.localeCompare(b.firstName, undefined, { sensitivity: 'base' }));

    if(this.selectedActor && !this.isNew){
      actors.forEach(x =>{
        if(x.userId == this.selectedActor.userId){
          x.roles = this.selectedActor.roles
          x.enabled = this.selectedActor.enabled
        } 
      })
      this.isNew = false;
    }
    
    return actors
  }

  groupByUserId(roles) {
     return roles.reduce((group, item) => {
      (group[item.userId] = group[item.userId] || []).push(item);
      return group;
    }, {});
  }

  getRolToolTip(roles) {
    return roles.filter(x => x.enabled).map(x => x.roleName).join(',')
  }

  getRolDescription(roles) {
    if(!roles.some(x => x.enabled)) return 'sin roles activos'
    return roles.filter(x => x.enabled).length > 1 ? 'varios roles' : roles.filter(x => x.enabled)[0].roleName
  }
}
