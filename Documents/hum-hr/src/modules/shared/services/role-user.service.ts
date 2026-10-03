import { Injectable } from '@angular/core';
import { AppConfig } from 'src/app/app.config';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { RoleUserFind } from '../models/role-user-find.model';
import { RoleUserDetail } from '../models/role-user-detail.model';
import { OrganizationalUnit, ContainerType } from '../models';
import { OrganizationalUnitService } from './organizational-unit.service';
import { DocumentationType } from '../models/documentation-type.model';
import { Dictionary } from '../models/Generics/dictionary.model';
import { ContainerTypeService } from './container-type.service.';
import { DocumentationTypesService } from './documentation-types.service';
import { ActorDetail } from '../../shared/models/actor-detail.model';

@Injectable({
  providedIn: 'root'
})
export class RoleUserService {
  url = AppConfig.settings.apiUrls.cpp;
  ou: OrganizationalUnit;

  constructor(private http: HttpClient,
    private organizationalUnitService: OrganizationalUnitService,
    private containerTypeService: ContainerTypeService,
    private documentationTypesService: DocumentationTypesService
  ) { }


  mapResponse(res: RoleUserDetail[]): RoleUserDetail[] {
    const roleUsers: RoleUserDetail[] = [];
    res.forEach(roleUser => {
      roleUsers.push(this.mapSingleResponse(roleUser));
    });

    return roleUsers;
  }

  private mapSingleResponse(res: RoleUserDetail): RoleUserDetail {
    let response: RoleUserDetail = new RoleUserDetail();
    if (!res) {
      return response;
    }
    response = res;
    response.selected = false;

    if (res.functions.some(f => f.name === 'OVERSEER')) {
      response.icon = 'fa-glasses';
    } else if (res.functions.some(f => f.name === 'FIRMANTE')) {
      response.icon = 'fa-pen-alt';
    } else if (res.functions.some(f => f.name === 'RRHH_CONTENT') && res.functions.some(f => f.name === 'RRHH_ACCESS')) {
      response.icon = 'fa-heart';
    } else if (res.functions.some(f => f.name === 'RRHH_CONTENT')) {
      response.icon = 'fa-hand-holding-heart';
    } else if (res.functions.some(f => f.name === 'RRHH_ADMIN')) {
      response.icon = 'fa-crown';
    } else if (res.functions.some(f => f.name === 'CANDIDATEADMIN')) {
      response.icon = 'fa-hand-holding-seedling';
    } else if (res.functions.some(f => f.name === 'RRHH_ACCESS')) {
      response.icon = 'fa-hands-helping';
    } else if (res.functions.some(f => f.name === 'RRHH_DOCUMENTS')) {
      response.icon = 'fa-cabinet-filing';
    } else if (res.functions.some(f => f.name === 'CANDIDATE_PROMOTE_INCOMPLETE')) {
      response.icon = 'fa-hand-holding-medical';
    } else if (res.functions.some(f => f.name === 'CANDIDATE_PROMOTE')) {
      response.icon = 'fa-hand-holding-seedling';
    } else if (res.functions.some(f => f.name === 'ADMIN_CANDIDATE_BASIC')) {
      response.icon = 'fa-hand-holding-seedling';
    } else {
      response.icon = 'fa-heart';
    }

    response.filters = [];
    response.documentationTypes = [];

    this.ou = this.organizationalUnitService.getCurrentOU();
    this.MapAdjectives(response, response.functions.some(f => f.name === 'CANDIDATEADMIN' || f.name === 'ADMIN_CANDIDATE_BASIC'));

    return response;
  }

  private MapAdjectives(response: RoleUserDetail, isCandidateAdminRole: boolean = false) {
    // Si no tiene adjetivaciones vuelvo igual
    if (!response.adjectiveRolesUser || response.adjectiveRolesUser.length < 1) {
      return;
    }

    const loadings = [];
    loadings.push(this.containerTypeService.getContainerType(response.organizationalUnitId.toString(), isCandidateAdminRole).toPromise());
    loadings.push(this.documentationTypesService.get(response.organizationalUnitId.toString()).toPromise());
    Promise.all(loadings)
    .then(res => {
      const contType: ContainerType = res[0];
      let documentationTypes: DocumentationType[];
      documentationTypes = res[1];

      response.adjectiveRolesUser?.forEach(adj => {
        if (adj.documentationTypeId) {
          const foundDt = documentationTypes.find(dt => dt.id === adj.documentationTypeId);
          if (foundDt) {
            response.documentationTypes.push(foundDt.name);
          }
        } else {
          if (contType) {
            const foundMetadata = contType.metadata.find(m => m.metadataId === adj.metadataId);
            if(foundMetadata != undefined){
              if(foundMetadata.optionValues != undefined){
                const options = JSON.parse(foundMetadata.optionValues.toString());

                const values = adj.metadataValue.split("||");
                const filter = { metadataId: foundMetadata.metadataId, name: foundMetadata.metadataLabel, values: [] };

                values.forEach(val => {
                  filter.values.push(options.find(o => o.value === val)?.description);
                });
            
                response.filters.push(filter);
              }
            }

          }
        }
      });
    });
  }

  find(parameters: RoleUserFind) {
    return this.http.put<any>(`${this.url}/RoleUsers/find`, parameters)
      .pipe(map(res => this.mapResponse(res)));
  }

  getById(id: number) {
    return this.http.get<RoleUserDetail>(`${this.url}/RoleUsers/${id}`)
      .pipe(map(res => this.mapSingleResponse(res)));
  }

  update(parameters: RoleUserDetail) {
    return this.http.put<any>(`${this.url}/RoleUsers`, parameters)
      .pipe(map(res => res));
  }

  enableUser(ids: number[]) {
    const params = {
      roleUsersIds: ids
    };
    return this.http.put(`${this.url}/RoleUsers/EnableRoleUser`, params);

  }

  updateAdjectives(roleUser: RoleUserDetail, isAdminCandidateRole: boolean = false,useAdjetivationRolSignatory: boolean = false,isFirmante: boolean = false) {
    const param = {
      id: roleUser.id,
      adjectiveRolesUser: roleUser.adjectiveRolesUser
    };

    if(isFirmante && useAdjetivationRolSignatory)
    {
      return this.http.put<any>(`${this.url}/RoleUsers/editSignerRole`, param)
      .pipe(map(res => {
        const roleUserDetail = new RoleUserDetail();
        roleUserDetail.adjectiveRolesUser = res.adjectiveRolesUser;
        roleUserDetail.organizationalUnitId = res.organizationalUnitId;
        this.MapAdjectives(roleUserDetail, isAdminCandidateRole);
        return roleUserDetail;
      }));
    }
    else if(!isFirmante && useAdjetivationRolSignatory)
    {
      return this.http.put<any>(`${this.url}/RoleUsers/editNonSignerRole`, param)
      .pipe(map(res => {
        const roleUserDetail = new RoleUserDetail();
        roleUserDetail.adjectiveRolesUser = res.adjectiveRolesUser;
        roleUserDetail.organizationalUnitId = res.organizationalUnitId;
        this.MapAdjectives(roleUserDetail, isAdminCandidateRole);
        return roleUserDetail;
      }));
    }
    else
    {
      return this.http.put<any>(`${this.url}/RoleUsers/adjective`, param)
        .pipe(map(res => {
          const roleUserDetail = new RoleUserDetail();
          roleUserDetail.adjectiveRolesUser = res.adjectiveRolesUser;
          roleUserDetail.organizationalUnitId = res.organizationalUnitId;
          this.MapAdjectives(roleUserDetail, isAdminCandidateRole);
          return roleUserDetail;
        }));
    }
  }
}
