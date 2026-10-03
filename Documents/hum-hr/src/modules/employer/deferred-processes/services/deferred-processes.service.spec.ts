import { TestBed } from '@angular/core/testing';

import { DeferredProcessesService } from './deferred-processes.service';

describe('DeferredProcessesService', () => {
  let service: DeferredProcessesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeferredProcessesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
