import { TestBed } from '@angular/core/testing';

import { EspecialitiesService } from './especialities.service';

describe('EspecialitiesService', () => {
  let service: EspecialitiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EspecialitiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
