import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessStageHistoryCardComponent } from './process-stage-history-card.component';

describe('ProcessStageHistoryCardComponent', () => {
  let component: ProcessStageHistoryCardComponent;
  let fixture: ComponentFixture<ProcessStageHistoryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessStageHistoryCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessStageHistoryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
