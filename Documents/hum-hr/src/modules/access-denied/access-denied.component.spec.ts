import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AccessDeniedComponent } from './access-denied.component';
import { CommonModule } from '@angular/common';
import { MyMaterialModule } from '../../app.material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from '../shared/errorHandler/message.service';

describe('AccessDeniedComponent', () => {
  let component: AccessDeniedComponent;
  let fixture: ComponentFixture<AccessDeniedComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessDeniedComponent ],
      imports: [
        CommonModule,
        MyMaterialModule,
        FlexLayoutModule,
        FormsModule
      ],
      providers: [
        Router,
        MessageService
     ]

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessDeniedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
