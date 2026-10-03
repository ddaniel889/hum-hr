import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WelcomeEmployerComponent } from './welcomeEmployer.component';

xdescribe('WelcomeEmployerComponent', () => {
  let component: WelcomeEmployerComponent;
  let fixture: ComponentFixture<WelcomeEmployerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WelcomeEmployerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeEmployerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
