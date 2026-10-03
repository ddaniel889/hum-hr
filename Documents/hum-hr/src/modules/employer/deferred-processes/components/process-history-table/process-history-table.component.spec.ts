import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessHistoryTableComponent } from './process-history-table.component';

describe('ProcessHistoryTableComponent', () => {
  let component: ProcessHistoryTableComponent;
  let fixture: ComponentFixture<ProcessHistoryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessHistoryTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessHistoryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
