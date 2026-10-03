import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { MessageService } from '../errorHandler/message.service';
import { OrganizationalUnitService } from './organizational-unit.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly msjService: MessageService,
    private readonly ouService: OrganizationalUnitService
  ) { }

  userHasFunction(roles: Array<string>): boolean {
    const userRoles = this.auth.getUserRoles();
    if (roles == null) {
      return false;
    }

    if (userRoles == null) {
      return false;
    }

    const userRoleList = userRoles.split(",");

    const haveRights = roles.some(v => userRoleList.includes(v));
    return (roles == null || haveRights);
  }

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!this.auth.isAuthenticated()) {

      if (this.auth.isSamlActive()) {
        window.location.href = this.auth.getSamlReturnUrl();
        return false;
      }
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const featureFlag = next.data['featureFlag'] as string;
    if (featureFlag) {
      const hasFeature = await this.checkFeatureFlag(featureFlag);
      if (!hasFeature) {
        this.msjService.showInfo('Esta funcionalidad no está disponible para su organización.');
        this.router.navigate(['accessDenied']);
        return false;
      }
    }

    const roles = next.data['roles'] as Array<string>;
    const canAcces = this.userHasFunction(roles);
    if (!canAcces) {
      this.msjService.showInfo('No posee permisos para acceder a la info.');
      this.router.navigate(['accessDenied']);
      return false;
    }

    if (canAcces && next.params.ouId) {
      await this.auth.setUserOu(next.params.ouId);
    }

    return canAcces;
  }

  /**
   * Verifica si alguna organización habilitada en el árbol tiene un feature flag específico activo
   * @param flagName - Nombre del feature flag a verificar (ej: 'useConnect', 'useDashboard')
   * @returns Promise<boolean> - true si al menos una OU habilitada tiene el feature flag en true, false en caso contrario
   */
  private async checkFeatureFlag(flagName: string): Promise<boolean> {
    try {
      const ous = await this.ouService.getTreeInMemory();
      return ous?.some((ou) => ou?.enabled && ou?.[flagName] === true);
    } catch (error) {
      console.error(`Error al verificar feature flag '${flagName}':`, error);
      return false;
    }
  }
}
