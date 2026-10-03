/* tslint:disable:no-unused-variable */
import { TestBed, ComponentFixture, tick, waitForAsync } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../shared/auth/auth.service';
import { ProfileService } from '../shared/services/profile.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CuilPipe } from '../shared/pipes/cuil.pipe';
import { HttpClientModule } from '@angular/common/http';
import { AppConfig } from 'src/app/app.config';
import { MessageService } from '../shared/errorHandler/message.service';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';


class RouterStub {
  navigate(parameters) {
  }
}

class MessageServiceStub {
  showError(error) {
  }
}

describe('Component: Profile', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authService: AuthService;
  let profileService: ProfileService;

  beforeEach(waitForAsync(() => {
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
      declarations: [
        ProfileComponent,
        CuilPipe
      ],
      imports: [
        MatListModule,
        MatIconModule,
        HttpClientModule,
        OverlayModule,
        FormsModule,
        MatInputModule,
        BrowserAnimationsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: Router, useClass: RouterStub },
        { provide: MessageService, useClass: MessageServiceStub },
        AuthService,
        ProfileService,
        MatSnackBar
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    authService = TestBed.get(AuthService);
    profileService = TestBed.get(ProfileService);
    fixture.detectChanges();
  });

  it('should call logout of AuthService and redirect the user to the login on logout', () => {
    const router = TestBed.get(Router);
    const spy = spyOn(router, 'navigate');
    spyOn(authService, 'isAuthenticated').and.returnValue(false);

    component.logOut();

    expect(spy).toHaveBeenCalledWith(['login']);
  });

  it('should fill userProfile with the response of the service', waitForAsync(() => {
    const profile = {
      firstName: 'Nombre',
      cuil: '20123456780',
      lastName: 'Apellido',
      nickName: 'nick',
      mail: 'a@b.com',
      signatureImage: '',
      signatureImagePath: null,
      user: '1',
      id: 1
    };

    fixture.detectChanges();

    const spy = spyOn(profileService, 'getMyProfile').and.returnValue(of(profile));

    component.ngOnInit();
    fixture.detectChanges();

    fixture.whenStable().then(() => { // wait for async getQuote
      fixture.detectChanges();        // update view with quote
      expect(component.userProfile).toEqual(profile);
    });
  }));

  it('should call getMyProfile and getMyActiveCertificates on the profile service on init', () => {
    const profile = {
      firstName: 'Nombre',
      cuil: '20123456780',
      lastName: 'Apellido',
      nickName: 'nick',
      mail: 'a@b.com',
      signatureImage: '',
      signatureImagePath: null,
      user: '1',
      id: 1
    };
    const spy = spyOn(profileService, 'getMyProfile').and.returnValue(of(profile));
    const spyCertificate = spyOn(profileService, 'getMyActiveCertificates').and.returnValue(of(true));

    component.ngOnInit();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
    expect(spyCertificate).toHaveBeenCalled();
  });

  it('form shuold be INVALID', () => {
    const profile = {
      firstName: 'Nombre',
      cuil: '20123456780',
      lastName: 'Apellido',
      nickName: 'ApodoUsuario',
      mail: 'email@email.com',
      signatureImage: '',
      signatureImagePath: null,
      user: '1',
      id: 1
    };
    const spy = spyOn(profileService, 'getMyProfile').and.returnValue(of(profile));
    const spyCertificate = spyOn(profileService, 'getMyActiveCertificates').and.returnValue(of(true));

    component.ngOnInit();
    fixture.detectChanges();
    fixture.whenStable().then(() => { // wait for async getQuote
      component.isEditable = true;
      fixture.detectChanges();
      component.profileForm.controls['firstName'].setValue('');
      component.profileForm.controls['lastName'].setValue('');
      component.profileForm.controls['nickName'].setValue('');
      component.profileForm.controls['email'].setValue('');
      expect(component.profileForm.valid).toBeFalsy();
    });

  });


  it('form should be valid', () => {
    const profile = {
      firstName: 'Nombre',
      cuil: '20123456780',
      lastName: 'Apellido',
      nickName: 'ApodoUsuario',
      mail: 'email@email.com',
      signatureImage: '',
      signatureImagePath: null,
      user: '1',
      id: 1
    };
    const spy = spyOn(profileService, 'getMyProfile').and.returnValue(of(profile));
    const spyCertificate = spyOn(profileService, 'getMyActiveCertificates').and.returnValue(of(true));

    component.ngOnInit();
    fixture.detectChanges();
    fixture.whenStable().then(() => { // wait for async getQuote
      component.isEditable = true;
      fixture.detectChanges();
      component.profileForm.controls['firstName'].setValue('carlos');
      component.profileForm.controls['lastName'].setValue('perez');
      component.profileForm.controls['nickName'].setValue('juanpe');
      component.profileForm.controls['email'].setValue('juanpe@a.com');
      expect(component.profileForm.valid).toBeTruthy();
    });
  });
});
