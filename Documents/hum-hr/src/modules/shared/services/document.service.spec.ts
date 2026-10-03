import { TestBed, inject } from '@angular/core/testing';

import { FileService } from './file.service';

xdescribe('DocumentsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileService]
    });
  });

  it('should be created', inject(
    [FileService],
    (service: FileService) => {
      expect(service).toBeTruthy();
    }
  ));
});
