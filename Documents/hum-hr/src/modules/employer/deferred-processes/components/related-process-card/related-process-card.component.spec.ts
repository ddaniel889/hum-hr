import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedProcessCardComponent } from './related-process-card.component';

describe('RelatedProcessCardComponent', () => {
  let component: RelatedProcessCardComponent;
  let fixture: ComponentFixture<RelatedProcessCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelatedProcessCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelatedProcessCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
