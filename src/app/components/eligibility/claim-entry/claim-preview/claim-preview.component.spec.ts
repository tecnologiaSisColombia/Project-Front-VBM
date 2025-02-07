import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimPreviewComponent } from './claim-preview.component';

describe('ClaimPreviewComponent', () => {
  let component: ClaimPreviewComponent;
  let fixture: ComponentFixture<ClaimPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
