import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DocumentDetailComponent } from './document-detail.component';
import { DocumentDetailRoutingModule } from './document-detail-routing.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MyMaterialModule } from 'src/app/app.material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { SignDocumentModule } from '../sign-document/sign-document.module';
import { PdfWrapperModule } from '../../shared/pdf-wrapper/pdf-wrapper.module';
import { PdfWrapperControlsModule } from '../../shared/pdf-wrapper-controls/pdf-wrapper-controls.module';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { EmployeeProcessService } from '../../shared/services/employee-process.service';
import { HttpClientModule } from '@angular/common/http';
import { AppConfig } from 'src/app/app.config';
import { MsjDescriptionPipe } from '../../shared/pipes/msj-description.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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

describe('DocumentDetailComponent', () => {
  let component: DocumentDetailComponent;
  let fixture: ComponentFixture<DocumentDetailComponent>;

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
        DocumentDetailRoutingModule,
        PdfViewerModule,
        MyMaterialModule,
        FlexLayoutModule,
        FormsModule,
        SignDocumentModule,
        PdfWrapperModule,
        PdfWrapperControlsModule,
        HttpClientModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: Router, useClass: RouterStub },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        EmployeeProcessService,
        MsjDescriptionPipe
      ],
      declarations: [DocumentDetailComponent]

    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
