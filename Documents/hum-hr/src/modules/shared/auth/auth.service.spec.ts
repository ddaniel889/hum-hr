import { TestBed, inject, getTestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClientModule, HttpRequest, HttpParams } from '@angular/common/http';
import { AppConfig } from '../../../app.config';
import { } from 'jasmine';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let injector: TestBed;
  let aService: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    AppConfig.settings = {
      application: {
        code: undefined,
        id: undefined
      },
      custom: {
        cpp2016: undefined,
        helpUrl: undefined
      },
      googleAnalyticsKey: undefined,
      apiUrls: {
        auth: undefined,
        wf: undefined,
        audit: undefined,
        cpp: undefined,
        edr: undefined,
        process: undefined
      }
    };

    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        HttpClientTestingModule
      ],
      providers: [
        AuthService
      ]
    });

    injector = getTestBed();
    aService = injector.get(AuthService);
    httpMock = injector.get(HttpTestingController);
    aService.logout();
  });

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));

  // it(`should send a post request on login`, async(inject([AuthService, HttpTestingController],
  //   (auth: AuthService, backend: HttpTestingController) => {
  //     auth.login('usuario', 'pass').subscribe();

  //     backend.expectOne((req: HttpRequest<any>) => {
  //       const body = new HttpParams({ fromString: req.body });
  //       return req.method === 'POST';
  //     }, `POST`);
  // })));

  it('should send a correct post request with User and Pss when login', () => {
    const dummyParams = new HttpParams()
      .set('client_id', 'CPPA_ARA')
      .set('client_secret', 'SECRET')
      .set('grant_type', 'password')
      .set('username', 'Usuario')
      .set('password', 'Pass');

    aService.login('Usuario', 'Pass').subscribe();

    const req = httpMock.expectOne(`${AppConfig.settings.apiUrls.auth}/token`);
    expect(req.request.url).toBe(`${AppConfig.settings.apiUrls.auth}/token`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dummyParams);

    httpMock.verify();
  });

  it('should return the values from the token', () => {
    const token = {
      access_token: 'abcde1234',
      refreshToken: 'refreshAbcde1234',
      roles: 'ROL',
      organizationId: '1',
      expires_in: 3599
    };

    aService.login('Usuario', 'Pass').subscribe(t => {
      expect(t).toEqual(token);
    }
    );

    const req = httpMock.expectOne(`${AppConfig.settings.apiUrls.auth}/token`);
    expect(req.request.url).toBe(`${AppConfig.settings.apiUrls.auth}/token`);

    req.flush(token);

    httpMock.verify();
  });

  it('should save on LocalStorage the given token data', () => {
    const token = {
      access_token: 'abcde1234',
      refresh_token: 'refreshAbcde1234',
      roles: 'ROL',
      organizationId: '1',
      expires_in: 3599
    };

    aService.login('Usuario', 'Pass').subscribe();

    const req = httpMock.expectOne(`${AppConfig.settings.apiUrls.auth}/token`);
    req.flush(token);


    httpMock.verify();

    expect(localStorage.getItem('access_token')).toEqual('abcde1234');
    expect(localStorage.getItem('refresh_token')).toEqual('refreshAbcde1234');
    expect(localStorage.getItem('roles')).toEqual('ROL');
    expect(localStorage.getItem('organizationId')).toEqual('1');
  });

  it('should return userRoles when GetUserRoles is called', () => {
    const mockRol = 'ROLES';
    localStorage.setItem('roles', mockRol);

    const roles = aService.getUserRoles();

    expect(roles).toEqual(mockRol);
  });

  it('should return FALSE when isAuthenticatedis called but no athentication data is stored', () => {
    expect(aService.isAuthenticated()).toBeFalsy();
  });

  it('should return TRUE when isAuthenticatedis called and athentication data is stored', () => {
    localStorage.setItem('access_token', '1234');

    expect(aService.isAuthenticated()).toBeTruthy();
  });
});
