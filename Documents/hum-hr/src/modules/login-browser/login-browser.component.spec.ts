import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoginBrowserComponent } from './login-browser.component';

describe('LoginBrowserComponent', () => {
  let component: LoginBrowserComponent;
  let fixture: ComponentFixture<LoginBrowserComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginBrowserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
