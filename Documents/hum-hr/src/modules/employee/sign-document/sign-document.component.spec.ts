import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SignDocumentComponent } from './sign-document.component';
import { MyMaterialModule } from '../../../app.material';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { MsjDescriptionPipe } from '../../shared/pipes/msj-description.pipe';
import { EmployeeProcessService } from '../../shared/services/employee-process.service';
import { AppConfig } from 'src/app/app.config';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EmployeeProcess } from '../../shared/models';
import { By } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { SimpleChanges, SimpleChange } from '@angular/core';

describe('SignDocumentComponent', () => {
  let component: SignDocumentComponent;
  let fixture: ComponentFixture<SignDocumentComponent>;

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
      declarations: [SignDocumentComponent],
      imports: [
        MatIconModule,
        MyMaterialModule,
        FormsModule,
        FlexLayoutModule,
        HttpClientModule,
        BrowserAnimationsModule
      ],
      providers: [
        MsjDescriptionPipe,
        EmployeeProcessService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should show Firmado Correctamente and the fa-check icon when it's signed with _estrec = C", () => {
    // Arrange => Creo un proceso con el estado de firma y el _estrec en C
    const date = new Date();
    const empProcess = new EmployeeProcess(
      '1',
      'Fake process',
      0,
      'Fake OU',
      0,
      'Fake processTypeName',
      'Fake StateId',
      'Fake stateName',
      'Fake stateAlias',
      date,
      false, // IsSignable
      [],
      [],
      undefined
    );
    const metadata = {
      name: '',
      description: 'Correctamente',
      systemName: '_estrec',
      value: 'C'
    };
    empProcess.metadataValues.push(metadata);
    const pipe = new DatePipe('en');
    const dateString = pipe.transform(date, 'dd/MM/yyyy');
    const desc = 'Firmado el ' + dateString;
    component.employeeProcess = empProcess;

    // Act => abro el componenete
    fixture.detectChanges();
    // const de = fixture.debugElement.query( By.css('.avatar'));
    const deIcon = fixture.debugElement.query(By.css('.fa-check'));
    // const el: HTMLElement = de.nativeElement;

    // Assert => deberia aparecer el cartel "Firmado Correctamente"
    // expect(el.innerText).toContain(desc);
    expect(deIcon).toBeTruthy();
  });

  it("should show Firmado No Conforme and the fa-times icon when it's signed with _estrec = NC", () => {
    // Arrange => Creo un proceso con el estado de firma y el _estrec en NC
    const date = new Date();
    const empProcess = new EmployeeProcess(
      '1',
      'Fake process',
      0,
      'Fake OU',
      0,
      'Fake processTypeName',
      'Fake StateId',
      'Fake stateName',
      'Fake stateAlias',
      date,
      false, // IsSignable
      [],
      [],
      undefined
    );
    const metadata = {
      name: '',
      description: 'No Conforme',
      systemName: '_estrec',
      value: 'NC'
    };
    empProcess.metadataValues.push(metadata);
    const pipe = new DatePipe('en');
    const dateString = pipe.transform(date, 'dd/MM/yyyy');
    const desc = 'Firmado el ' + dateString;
    component.employeeProcess = empProcess;

    // Act => abro el componenete
    fixture.detectChanges();
    // const de = fixture.debugElement.query( By.css('.avatar'));
    const deIcon = fixture.debugElement.query(By.css('.fa-times'));
    // const el: HTMLElement = de.nativeElement;

    // Assert => deberia aparecer el cartel "Firmado No Conforme"
    // expect(el.innerText).toContain(desc);
    expect(deIcon).toBeTruthy();
  });

  it("should show Motivo de disconformidad when it's signed with _estrec = NC and motiveDisagreement is not null", () => {
    // Arrange => Creo un proceso con el estado de firma y el _estrec en NC and motiveDisagreement is not null
    const date = new Date();
    const empProcess = new EmployeeProcess(
      '1',
      'Fake process',
      0,
      'Fake OU',
      0,
      'Fake processTypeName',
      'Fake StateId',
      'Fake stateName',
      'Fake stateAlias',
      date,
      false, // IsSignable
      [],
      [],
      undefined
    );
    const metadata = {
      name: '',
      description: 'No Conforme',
      systemName: '_estrec',
      value: 'NC'
    };
    const mMotive = {
      name: '',
      description: '',
      systemName: '_motivodisc',
      value: 'ECL'
    };

    empProcess.metadataValues.push(metadata);
    empProcess.metadataValues.push(mMotive);
    component.employeeProcess = empProcess;

    // Act => abro el componenete
    component.ngOnChanges({
      name: new SimpleChange(null, component.employeeProcess, true)
    });
    fixture.detectChanges();

    const de = fixture.debugElement.query(By.css('#motiveDisagreement'));
    const el: HTMLElement = de.nativeElement;

    // Assert => deberia aparecer el cartel "Firmado No Conforme"
    expect(el.innerText).toContain('(Error de condición laboral)');
    expect(component.motiveDisagreement).toBe('Error de condición laboral');
  });

  it("should not show Motivo de disconformidad when it's signed with _estrec = NC but motiveDisagreement is null", () => {
    // Arrange => Creo un proceso con el estado de firma y el _estrec en NC and motiveDisagreement is null
    const date = new Date();
    const empProcess = new EmployeeProcess(
      '1',
      'Fake process',
      0,
      'Fake OU',
      0,
      'Fake processTypeName',
      'Fake StateId',
      'Fake stateName',
      'Fake stateAlias',
      date,
      false, // IsSignable
      [],
      [],
      undefined
    );
    const metadata = {
      name: '',
      description: 'No Conforme',
      systemName: '_estrec',
      value: 'NC'
    };
    const mMotive = {
      name: '',
      description: '',
      systemName: '_motivodisc',
      value: ''
    };

    empProcess.metadataValues.push(metadata);
    empProcess.metadataValues.push(mMotive);
    component.employeeProcess = empProcess;

    // Act => abro el componenete
    component.ngOnChanges({
      name: new SimpleChange(null, component.employeeProcess, true)
    });
    fixture.detectChanges();

    const de = fixture.debugElement.query(By.css('#motiveDisagreement'));

    // Assert => deberia no existir el DE
    expect(de).toBeNull();
    expect(component.motiveDisagreement).toBeNull();
  });

});
