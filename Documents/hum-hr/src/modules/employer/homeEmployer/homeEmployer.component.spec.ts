import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HomeEmployerComponent } from './homeEmployer.component';

xdescribe('HomeEmployerComponent', () => {
  let component: HomeEmployerComponent;
  let fixture: ComponentFixture<HomeEmployerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeEmployerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeEmployerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
