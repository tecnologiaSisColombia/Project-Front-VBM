import { TestBed } from '@angular/core/testing'

import { InsurersService } from './insurers.service'

describe('InsuranceService', () => {
  let service: InsurersService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(InsurersService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
