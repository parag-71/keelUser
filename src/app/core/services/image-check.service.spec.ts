import { TestBed } from '@angular/core/testing';

import { ImageCheckService } from './image-check.service';

describe('ImageCheckService', () => {
  let service: ImageCheckService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageCheckService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
