import { TestBed } from '@angular/core/testing';

import { PlantResourceService } from './plant-resource.service';

describe('PlantResourceService', () => {
  let service: PlantResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlantResourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
