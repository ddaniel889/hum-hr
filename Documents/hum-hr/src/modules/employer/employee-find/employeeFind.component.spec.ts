import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EmployeeFindComponent } from './employeeFind.component';

xdescribe('EmployeeFindComponent', () => {
  let component: EmployeeFindComponent;
  let fixture: ComponentFixture<EmployeeFindComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeFindComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeFindComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
