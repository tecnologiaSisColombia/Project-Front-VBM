import { TestBed } from '@angular/core/testing';
import { SubplanService } from './subplan.service';

describe('SubplanService', () => {
  let service: SubplanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubplanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
