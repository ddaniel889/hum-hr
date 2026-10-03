import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { PwdResetComponent } from './pwd-reset.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyMaterialModule } from 'src/app/app.material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PwdResetRoutingModule } from './pwd-reset.routes';
import { AppConfig } from 'src/app/app.config';
import { HttpClientModule } from '@angular/common/http';
import { Router, ActivatedRoute, Data } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { MessageService } from '../shared/errorHandler/message.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from '../shared/auth/auth.service';


class RouterStub {
  navigate(parameters) {
  }
}

class ActivatedRouteStub {
  private subject = new BehaviorSubject<any[]>([]);

  get params() {
    return this.subject.asObservable();
  }

  push(value) {
    this.subject.next(value);
  }

}

class MessageServiceStub {
  showError(error) {
  }
}

describe('PassResetComponent', () => {
  let component: PwdResetComponent;
  let fixture: ComponentFixture<PwdResetComponent>;
  let msjSerive: MessageService;
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
      declarations: [PwdResetComponent],
      imports: [
        CommonModule,
        FormsModule,
        MyMaterialModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        PwdResetRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: Router, useClass: RouterStub },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: MessageService, useClass: MessageServiceStub },
        AuthService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PwdResetComponent);
    component = fixture.componentInstance;
    msjSerive = TestBed.get(MessageService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it(' el formulario deberia ser INVALIDO cuando los campos de contraseña y confirmar contraseña los blanqueo', () => {

    component.ngOnInit();
    fixture.detectChanges();

    component.passwordFormGroup.controls['password'].setValue('Ab123456');
    component.passwordFormGroup.controls['passwordConfirm'].setValue('Ab123456');
    fixture.detectChanges();
    component.passwordFormGroup.controls['password'].setValue('');
    component.passwordFormGroup.controls['passwordConfirm'].setValue('');
    fixture.detectChanges();

    expect(component.passwordFormGroup.valid).toBeFalsy();
  });

  it(' Cuando las contraseñas son distintas, al guardar, debe aparecer un cartel de error', () => {

    component.ngOnInit();
    component.pwdmodel.code = 'ABCDE';
    component.passwordFormGroup.controls['password'].setValue('Ab111111');
    component.passwordFormGroup.controls['passwordConfirm'].setValue('Ab22222222');

    const spy = spyOn(msjSerive, 'showError');

    component.save();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });
});
