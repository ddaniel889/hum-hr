import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { map } from "rxjs/operators";
import { AppConfig } from "../../../app.config";
import { IPwdReset, IPwdChange } from "../models/pwd-reset.model";
import { Observable, observable, of } from "rxjs";
import { ICurrentUser, OrganizationalUnit, OrganizationalUnitConfig } from "../models";
import { Router } from "@angular/router";
import { KeyValuePair } from "../models/Generics/ikeyValuePair.model";
import { IIdProviderConfig } from "../models/IIdProviderConfig";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  url = AppConfig.settings.apiUrls.auth;
  urlCPP = AppConfig.settings.apiUrls.cpp;
  identityChangedCallbacks = [];

  httpOptions = {
    headers: AppConfig.settings.application.useClickjackingProteccion ? this.buildHttpHeader() : new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
      Application: AppConfig.settings.application.code,
    })
  };

  constructor(
    private http: HttpClient,
    private router: Router,
  ) { }

  login(user, password, subdomain) {
    let clientId = "CPPA_ARA";
    if (subdomain && subdomain != "") {
      clientId = "CPPA_ARA;SUBDOMAIN";
      password = `{"pass":"${password}", "sub":"${subdomain}"}`;
    }

    const body = new HttpParams()
      .set("client_id", clientId)
      .set("client_secret", "SECRET")
      .set("grant_type", "password")
      .set("username", user)
      .set("password", encodeURIComponent(password));
    return this.http.post(`${this.url}/token`, body, this.httpOptions).pipe(
      map(res => {
        this.setSession(res, clientId);
        return res;
      })
    );
  }

  loginOTP(user, password, otp: string, subdomain: string) {
    let clientId = "CPPA_ARA;OTP";
    if (subdomain && subdomain != "") {
      clientId = "CPPA_ARA;OTP;SUBDOMAIN";
      password = `{"pass":"${password}", "sub":"${subdomain}", "otp":"${otp}"}`;
    } else {
      clientId = "CPPA_ARA;OTP";
      password = `{"pass":"${password}", "otp":"${otp}"}`;
    }

    const body = new HttpParams()
      .set("client_id", clientId)
      .set("client_secret", "SECRET")
      .set("grant_type", "password")
      .set("username", user)
      .set("password", encodeURIComponent(password));
    return this.http.post(`${this.url}/token`, body, this.httpOptions).pipe(
      map(res => {
        this.setSession(res, clientId);
        return res;
      })
    );
  }

  private setSession(authResult, refreshClient: string): void {
    localStorage.clear();
    localStorage.setItem("access_token", authResult.access_token);
    localStorage.setItem("roles", authResult.roles);
    localStorage.setItem("usersOu", authResult.usersOu);
    localStorage.setItem("organizationId", authResult.organizationId);
    localStorage.setItem("organizationName", authResult.appOrganizationName);
    localStorage.setItem("organizationDescription", authResult.appOrganizationDescription);
    localStorage.setItem("refresh_token", authResult.refresh_token);
    localStorage.setItem("userId", authResult.userId);
    localStorage.setItem("userNick", authResult.userNick);
    localStorage.setItem("userFirstname", authResult.userName);
    localStorage.setItem("userLastname", authResult.userLastname);
    localStorage.setItem("refreshClient", refreshClient);
    localStorage.setItem("isSamlActive", authResult.isSamlActive);
    localStorage.setItem("expires_in", authResult.expires_in);
    this.hasFiltersMetadatos().subscribe(res => {
      res.length > 0 ? localStorage.setItem("hasAdjetivation", "true") : localStorage.setItem("hasAdjetivation", "false");
      res.filter(x => x.personType == "EMPLEADO" && x.documentTypeId == null).length>0 ? localStorage.setItem("hasFiltersMetadataEmployee", "true") : localStorage.setItem("hasFiltersMetadataEmployee", "false");
      res.filter(x => x.personType == "CANDIDATO" && x.documentTypeId == null).length>0 ? localStorage.setItem("hasFiltersMetadataCandidate", "true") : localStorage.setItem("hasFiltersMetadataCandidate", "false");
      res.filter(x => x.personType == "EMPLEADO" && x.documentTypeId != null).length>0 ? localStorage.setItem("hasFiltersDocumentsEmployee", "true") : localStorage.setItem("hasFiltersDocumentsEmployee", "false");
      res.filter(x => x.personType == "CANDIDATO" && x.documentTypeId != null).length>0 ? localStorage.setItem("hasFiltersDocumentsCandidate", "true") : localStorage.setItem("hasFiltersDocumentsCandidate", "false");
      res.filter(x=>x.documentTypeId == null).length>0 ? localStorage.setItem("hasFiltersMetadata","true") : localStorage.setItem("hasFiltersMetadata","false");
      res.filter(x=>x.documentTypeId != null && x.metadataId == null).length>0 ? localStorage.setItem("hasFiltersDocuments","true") : localStorage.setItem("hasFiltersDocuments","false");
      localStorage.setItem("allAdjetivation", JSON.stringify(res));
    });
    this.hasFilterAdjetivation(0).subscribe(res =>{      
       if(res.length > 0)
       {
         localStorage.setItem("allAdjetivationEmployee", JSON.stringify(true));
       }
       else
       {
         localStorage.setItem("allAdjetivationEmployee", JSON.stringify(false));
       }
    });
    if (authResult.isSamlActive && JSON.parse(authResult.isSamlActive)) {
      const returnUrl = authResult.samlReturnUrl.match("http[s]?://.*") ? authResult.samlReturnUrl : 'http://' + authResult.samlReturnUrl;
      localStorage.setItem("samlReturnUrl", returnUrl);
    }

    this.identityChanged();
  }

  logout(redirect = false) {
    const samlReturnUrl = this.getSamlReturnUrl();
    const isSamlActive = this.isSamlActive();

    localStorage.clear();
    this.identityChanged();

    if (redirect) {
      if (isSamlActive) {
        window.location.href = samlReturnUrl;
      } else {
        this.router.navigate(['login']);
      }
    }
  }

  refreshToken(): Observable<ICurrentUser> {
    // Reemplazo el access_token por el nuevo
    const client = localStorage.getItem("refreshClient") ? localStorage.getItem("refreshClient") : "CPPA_ARA";
    const body = new HttpParams()
      .set("client_id", client)
      .set("client_secret", "SECRET")
      .set("grant_type", "refresh_token")
      .set("refresh_token", localStorage.getItem("refresh_token"));
    return this.http
      .post<ICurrentUser>(`${this.url}/token`, body, this.httpOptions)
      .pipe(
        map(user => {
          if (user && user.access_token) {
            this.setSession(user, client);
          }

          return <ICurrentUser>user;
        })
      );
  }

  getUserRoles(): string {
    return localStorage.getItem("roles");
  }

  getOrganizationId(): string {
    return localStorage.getItem("organizationId");
  }

  getOrganizationName(): string {
    return localStorage.getItem('organizationName');
  }

  getOrganizationDescription(): string {
    return localStorage.getItem('organizationDescription');
  }

  getUserFirstName(): string {
    return localStorage.getItem('userFirstname');
  }

  getUserLastName(): string {
    return localStorage.getItem('userLastname');
  }

  getOrganizationalUnits(): OrganizationalUnit[] {
    const userOus = JSON.parse(localStorage.getItem("usersOu"));
    const organizationalUnits = [];

    for (let index = 0; index < userOus.length; index++) {
      const ou = userOus[index].organizationalUnit;

      if (ou) {
        organizationalUnits.push({
          id: ou.id,
          name: ou.name,
          isRoot: ou.isRoot,
          roles: userOus[index].roles
        });
      }
    }

    return organizationalUnits;
  }

  isInRole(rol: string): boolean {
    if (!localStorage.getItem("roles")) {
      return false;
    }
    const roles = localStorage.getItem("roles").split(",");

    return roles.indexOf(rol) >= 0;
  }

  getUserId(): string {
    return localStorage.getItem("userId");
  }

  getUserNick(): string {
    return localStorage.getItem("userNick");
  }

  isAuthenticated(): Boolean {
    // If the user have a access_Token we can assume that is Authenticated
    let haveToken = false;
    if (this.getAccesToken()) {
      haveToken = true;
    }

    return haveToken;
  }

  isSamlActive(): boolean {
    const isSamlActive = JSON.parse(localStorage.getItem('isSamlActive'));
    return isSamlActive;
  }

  isLicenseConfig(){
    return this.isInRole('LEAVECONFIG');
  }

  isRRHH() {
    return this.isInRole('RRHH_CONTENT');
  }

  RRHHManagment() {
    return this.isInRole('RRHH_ADMIN');
  }

  isAdministrator() {
    return this.isInRole('RRHH_ACCESS');
  }

  isLeaveManager(){
     return this.isInRole('LEAVEMANAGE');
  }

  isLeaveApprov(){
    return this.isInRole('LEAVEAPROV');
  }

  isLeaveConfig(){
    return this.isInRole('LEAVECONFIG');
 }

  employeeManagement() {
    return this.isInRole('MANAGE_EMPLOYEES');
  }

  isCandidateAdmin() {
    return this.isInRole('CANDIDATEADMIN');
  }

  isLSDSigner() {
    return this.isInRole('LAWBOOK SIGN');
  }

  isLSDWrite() {
    return this.isInRole('LAWBOOK WRITE');
  }

  isOverseer() {
    return this.isInRole('OVERSEER');
  }

  canEdit() {
    return this.isInRole('EMPLOYER EDIT');
  }

  isFirmante() {
    return this.isInRole('FIRMANTE');
  }

  isGestorDocumental() {
    return this.isInRole('RRHH_DOCUMENTS');
  }

  isCandidate() {
    return !this.isInRole('EMPLOYEE LD') && this.isInRole('CANDIDATE');
  }

  getSamlReturnUrl(): string {
    if (this.isSamlActive()) {
      return localStorage.getItem("samlReturnUrl");
    }
    return null;
  }

  getAccesToken(): any {
    return localStorage.getItem("access_token");
  }

  isCandidateAdminBasic() {
    return this.isInRole('ADMIN_CANDIDATE_BASIC');
  }
  forgotPassword(
    username: string,
    changePasswordCallbackUrl: string,
    appid: string,
    subdomain: string
  ): Observable<any> {
    let params = new HttpParams();

    if (subdomain && subdomain != "") {
      appid = appid + ";SUBDOMAIN";
      username = username + ";" + subdomain;
    }
    params = params.append("userName", username);
    params = params.append("callbackUrl", changePasswordCallbackUrl);
    params = params.append("appId", appid);

    return this.http
      .get<any>(`${this.url}/Account/ForgotPassword`, { params: params })
      .pipe(map(res => res));
  }

  resetPassword(pwd: IPwdReset): Observable<any> {
    const httpOpt = {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    };

    const postData = JSON.stringify(pwd);
    return this.http
      .post<any>(`${this.url}/Account/ResetPassword`, postData, httpOpt)
      .pipe(map(res => res));
  }

  changePassword(pwd: IPwdChange) {
    const httpOpt = {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    };

    const postData = JSON.stringify(pwd);
    return this.http
      .post<any>(`${this.url}/Account/ChangePassword`, postData, httpOpt)
      .pipe(map(res => res));
  }

  onIdentityChanged(callback) {
    this.identityChangedCallbacks.push(callback);
  }

  async setUserOu(ou: string): Promise<any> {
    // si ya esta no lo cambio
    if (this.getOrganizationId() === ou) {
      return;
    }


    return await this.changeUserOu(ou)
      .toPromise()
      .then(async () => {
        return await this.refreshToken().toPromise();
      });
  }

  async setUser(userId: string): Promise<any> {

    return await this.changeUser(userId)
      .toPromise()
      .then(async () => {
        return await this.refreshToken().toPromise();
      });
  }

  async getTokenChangeApp(): Promise<string> {
    return await this.changeApp()
      .toPromise()
      .then(async (result) => {
        return result.token;
      });
  }

  getAccess(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/AppSwitch/GetAccess`);
  }

  hasAnyRole(userRoles, rolesToCheck) {
    return rolesToCheck.some(role => userRoles.includes(role));
  }

  getAppLinks(usersOus: any[], sameOuEmployee = false, sameOuEmployer = false) {
    let appLinks = [];
    const currentOu = this.getOrganizationId();

    if (usersOus.length > 0) {
      for (let index = 0; index < usersOus.length; index++) {
        const userOu = usersOus[index];

        if (this.isInRoleOu(userOu, ["PAYCHECK READ"])) {
          appLinks.push({
            link: `${AppConfig.settings.custom.cpp2016}/#/?t=`,
            description: 'Ir a Humanage 2016 RRHH ' + userOu.organizationalUnit.name,
            roleName: 'Ir a Humanage 2016 RRHH ' + userOu.organizationalUnit.name,
            organizationalUnitId: userOu.organizationalUnit.id,
            userId: userOu.userId,
            humanageTheme: userOu.organizationalUnit.humanageTheme
          });
        }

        if (currentOu && userOu.organizationalUnit.id !== +currentOu || sameOuEmployer) {
          if (this.isInRoleOu(userOu, ["FIRMANTE"], ["RRHH_CONTENT", "RRHH_ACCESS"])) {
            appLinks.push({
              organizationalUnitId: userOu.organizationalUnit.id,
              module: "signer",
              description: `${'Firmante'} - ${userOu.organizationalUnit.name}`,
              roleName: 'Firmante',
              ouName: userOu.organizationalUnit.name,
              userId: userOu.userId,
              humanageTheme: userOu.organizationalUnit.humanageTheme
            });
          }

          if (this.isInRoleOu(userOu, ["OVERSEER"], ["RRHH_CONTENT", "FIRMANTE", "RRHH_ACCESS", "RRHH_DOCUMENTS"])) {
            appLinks.push({
              organizationalUnitId: userOu.organizationalUnit.id,
              module: "overseer",
              description: `${'Consulta'} - ${userOu.organizationalUnit.name}`,
              roleName: 'Consulta',
              ouName: userOu.organizationalUnit.name,
              userId: userOu.userId,
              humanageTheme: userOu.organizationalUnit.humanageTheme
            });
          }

          if (this.isInRoleOu(userOu, ["RRHH_CONTENT"])) {
            appLinks.push({
              organizationalUnitId: userOu.organizationalUnit.id,
              module: "employer",
              description: `${'RRHH'} - ${userOu.organizationalUnit.name}`,
              roleName: 'RRHH',
              ouName: userOu.organizationalUnit.name,
              userId: userOu.userId,
              humanageTheme: userOu.organizationalUnit.humanageTheme
            });
          }

          if (this.isInRoleOu(userOu, ["RRHH_ACCESS"], ["RRHH_CONTENT"])) {
            appLinks.push({
              organizationalUnitId: userOu.organizationalUnit.id,
              module: "employer",
              description: `${'Administrador'} - ${userOu.organizationalUnit.name}`,
              roleName: 'Administrador',
              ouName: userOu.organizationalUnit.name,
              userId: userOu.userId,
              humanageTheme: userOu.organizationalUnit.humanageTheme
            });
          }

          if (this.isInRoleOu(userOu, ["CANDIDATEADMIN", "ADMIN_CANDIDATE_BASIC"], ["RRHH_CONTENT", "RRHH_ACCESS"])) {
            appLinks.push({
              organizationalUnitId: userOu.organizationalUnit.id,
              module: "candidateadmin",
              description: `${'Administrador de Candidatos'} - ${userOu.organizationalUnit.name}`,
              roleName: 'Administrador de Candidatos',
              ouName: userOu.organizationalUnit.name,
              userId: userOu.userId,
              humanageTheme: userOu.organizationalUnit.humanageTheme
            });
          }

          if (this.isInRoleOu(userOu, ["LEAVEAPROV"])) {
            appLinks.push({
              organizationalUnitId: userOu.organizationalUnit.id,
              module: "leaveaprov",
              description: `${'Aprobador de Solicitudes'} - ${userOu.organizationalUnit.name}`,
              roleName: 'Aprobador de Solicitudes',
              ouName: userOu.organizationalUnit.name,
              userId: userOu.userId,
              humanageTheme: userOu.organizationalUnit.humanageTheme
            });
          }

          if (this.isInRoleOu(userOu, ["RRHH_DOCUMENTS"], ["RRHH_CONTENT", "RRHH_ACCESS"])) {
            appLinks.push({
              organizationalUnitId: userOu.organizationalUnit.id,
              module: "jefe",
              description: `${'Gestionar Documentos'} - ${userOu.organizationalUnit.name}`,
              roleName: 'Gestionar Documentos',
              ouName: userOu.organizationalUnit.name,
              userId: userOu.userId,
              humanageTheme: userOu.organizationalUnit.humanageTheme
            });
          }
        }

        if (currentOu && userOu.organizationalUnit.id !== +currentOu || sameOuEmployee) {
          if (this.isInRoleOu(userOu, ["EMPLOYEE_2016", "EMPLOYEE LD"])) {
            appLinks.push({
              organizationalUnitId: userOu.organizationalUnit.id,
              module: "employee",
              isLd: userOu.roles.some(x => x == "EMPLOYEE LD"),
              description: `${'Empleado'} - ${userOu.organizationalUnit.name}`,
              roleName: 'Empleado',
              ouName: userOu.organizationalUnit.name,
              userId: userOu.userId,
              humanageTheme: userOu.organizationalUnit.humanageTheme
            });
          } else if (this.isInRoleOu(userOu, ["CANDIDATE"])) {
            appLinks.push({
              organizationalUnitId: userOu.organizationalUnit.id,
              module: "employee",
              isLd: true,
              description: `${'Candidato'} - ${userOu.organizationalUnit.name}`,
              roleName: 'Candidato',
              ouName: userOu.organizationalUnit.name,
              userId: userOu.userId,
              humanageTheme: userOu.organizationalUnit.humanageTheme
            });
          }
        }

        if (userOu.applicationsWithRoles.some(x => x == "EDR")) {
          appLinks.push({
            link: `${AppConfig.settings.custom.edr}/#/?t=`,
            description: 'Ir a EDR de ' + userOu.organizationalUnit.name,
            roleName: 'Ir a EDR',
            ouName: userOu.organizationalUnit.name,
            organizationalUnitId: userOu.organizationalUnit.id,
            userId: userOu.userId,
            humanageTheme: userOu.organizationalUnit.humanageTheme
          });
        }

        if (this.isInRoleOu(userOu, ["LAWBOOK READ"]) && !this.isInRoleOu(userOu,["LSD_HUMANAGE"])) {
          appLinks.push({
            link: `${AppConfig.settings.custom.cpp2016}/#/?t=`,
            description: 'Ir a Libro Ley de ' + userOu.organizationalUnit.name,
            roleName: 'Ir a Libro Ley',
            ouName: userOu.organizationalUnit.name,
            organizationalUnitId: userOu.organizationalUnit.id,
            userId: userOu.userId,
            humanageTheme: userOu.organizationalUnit.humanageTheme
          });
        }
      }
    }
    appLinks = appLinks.sort((a, b) => a.description > b.description ? 1 : -1);
    return appLinks;
  }

  isInRoleOu(userOu: any, roles: string[], notIn: string[] = []): boolean {
    return userOu.roles.some(x => {
      let inRoles = false;
      roles.forEach(r => inRoles = inRoles || x == r);
      return inRoles;
    }) && (notIn.length < 1 || !userOu.roles.some(x => {
      let notInRoles = false;
      notIn.forEach(r => notInRoles = notInRoles || x == r);
      return notInRoles;
    }));
  }

  getUserOus(appId?: string): Observable<OrganizationalUnitConfig[]> {
    if (!appId) {
      appId = AppConfig.settings.application.id;
    }

    return this.http
      .get<any>(
        `${this.url}/Logins/GetOuByApp/${appId}`
      )
      .pipe(
        map(res => {
          const ous: OrganizationalUnitConfig[] = [];
          for (const entity of res.value) {
            ous.push(
              new OrganizationalUnitConfig(
                entity.entityId,
                entity.entityDescription
              )
            );
          }
          return ous;
        })
      );
  }

  async anyRoleForApp(): Promise<boolean> {
    return await this.getUserOus(AppConfig.settings.custom.cpp2016AppId).toPromise()
      .then(ous => {
        if (ous.length > 0) {
          return true;
        }
        return false;
      });
  }

  private identityChanged() {
    this.identityChangedCallbacks.forEach(callback => {
      callback();
    });
  }

  private changeUserOu = function (ou: string): Observable<any> {
    return this.http.put(`${this.url}/logins/SetOu/${ou}`);
  };

  private changeUser = function (userId: string): Observable<any> {
    return this.http.put(`${this.url}/logins/SetUser/${userId}`);
  };

  private changeApp = function (): Observable<any> {
    return this.http.post(`${this.url}/AppSwitch`);
  };

  generateOTP(username: string, generateOTP: string, subdomain: string): Observable<any> {
    const params = {
      appId: AppConfig.settings.application.id,
      callbackUrl: generateOTP,
      userName: username,
      subdomain: subdomain
    };

    return this.http
      .get<any>(`${this.url}/UserOtps/GenerateOTP`, { params: params })
      .pipe(map(res => res));
  }

  getOtpQR = function (code: string): Observable<any> {
    const p = { code: code };

    return this.http.post(`${this.url}/UserOtps/QR`, p);
  };

  getSAML(ouId: number) {
    return this.http.get<any>(`${this.url}/saml/${ouId}`);
  }

  getIdProviderConfig(ouId: number) {
    return this.http.get<IIdProviderConfig>(`${this.url}/saml/GetSamlIdentityUserLogged/${ouId}`);
  }

  viewsAvailables(): KeyValuePair<string, string>[] {
    const views: KeyValuePair<string, string>[] = [];
    if (this.isCandidateAdmin() || this.isCandidateAdminBasic()) {
      views.push({ key: 'Candidatos', value: 'employer/candidate-find' });
    }
    if (this.isRRHH() || this.isAdministrator() || this.canEdit() || this.RRHHManagment() || this.isLeaveApprov()) {
      views.push({ key: 'Empleados', value: 'employer/employee-find' });
    }

    return views;
  }
  viewsAnalitycsAvailables(): KeyValuePair<string, string>[] {
    const views: KeyValuePair<string, string>[] = [];

    if (this.isRRHH()) {
      views.push({ key: 'Sets', value: 'employer/analytics-document-set' });
    }
    if (this.isRRHH()) {
      views.push({ key: 'Recibos de Sueldo', value: 'employer/analytics' });
    }
    return views;
  }

  hasFiltersMetadatos() {
    return this.http.get<any[]>(`${this.urlCPP}/Documentation/getAdjetivacion/`).pipe(map(res => res));
  }

  hasFilterAdjetivation(personType: number) {
    return this.http.get<any[]>(`${this.urlCPP}/Documentation/getAdjetivacion/${personType}`).pipe(map(res => res));
  }

  async createHuToken(): Promise<string> {
    return await this.huSwitches()
      .toPromise()
      .then(async (result) => {
        return result.token;
      });
  }

  huSwitches = function (): Observable<any> {
    const parameters = {
      accessToken : localStorage.getItem("access_token"),
      expireIn : parseInt(localStorage.getItem("expires_in"))
    };
    return this.http.post(`${this.url}/AppSwitch/husigner`,parameters)
  };

  buildHttpHeader(){
    const headers = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Frame-Options": "SAMEORIGIN",
      Application: AppConfig.settings.application.code,
    });
    return headers;
  }
}
