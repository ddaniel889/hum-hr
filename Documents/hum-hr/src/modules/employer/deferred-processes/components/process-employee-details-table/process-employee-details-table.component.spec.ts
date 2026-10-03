import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessEmployeeDetailsTableComponent } from './process-employee-details-table.component';

describe('ProcessEmployeeDetailsTableComponent', () => {
  let component: ProcessEmployeeDetailsTableComponent;
  let fixture: ComponentFixture<ProcessEmployeeDetailsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessEmployeeDetailsTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessEmployeeDetailsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
