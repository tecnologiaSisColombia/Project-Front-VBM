import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimFormPdfComponent } from './claim-form-pdf.component';

describe('ClaimFormPdfComponent', () => {
  let component: ClaimFormPdfComponent;
  let fixture: ComponentFixture<ClaimFormPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimFormPdfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimFormPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
