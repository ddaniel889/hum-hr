import { TestBed } from '@angular/core/testing';

import { OrganizationalUnitService } from './organizational-unit.service';

describe('OrganizationalUnitService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  xit('should be created', () => {
    const service: OrganizationalUnitService = TestBed.get(OrganizationalUnitService);
    expect(service).toBeTruthy();
  });
});
