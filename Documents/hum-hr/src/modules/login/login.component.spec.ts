import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { LoginRoutingModule } from './login-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyMaterialModule } from 'src/app/app.material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { AppConfig } from 'src/app/app.config';
import { MsjDescriptionPipe } from '../shared/pipes/msj-description.pipe';
import { Router, ActivatedRoute } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../shared/auth/auth.service';

class RouterStub {
  navigate(parameters) {
  }
}

class ActivatedRouteStub {

  private subject = new BehaviorSubject<any[]>([]);

  snapshot = {
    queryParams: []
  };

  get params() {
    return this.subject.asObservable();
  }

  push(value) {
    this.subject.next(value);
  }
}

xdescribe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
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
      imports: [
        LoginRoutingModule,
        FormsModule,
        MyMaterialModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        HttpClientModule,
        RouterTestingModule
      ],
      declarations: [LoginComponent],
      providers: [
        { provide: Router, useClass: RouterStub },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        MsjDescriptionPipe,
        AuthService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.get(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
