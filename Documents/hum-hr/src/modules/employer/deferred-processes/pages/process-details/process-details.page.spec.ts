import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessDetailsPage } from './process-details.page';


describe('ProcessDetailsComponent', () => {
  let component: ProcessDetailsPage;
  let fixture: ComponentFixture<ProcessDetailsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessDetailsPage ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
