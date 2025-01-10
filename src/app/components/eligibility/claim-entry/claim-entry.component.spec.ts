import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClaimEntryComponent } from './claim-entry.component';

describe('ClaimEntryComponent', () => {
  let component: ClaimEntryComponent;
  let fixture: ComponentFixture<ClaimEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimEntryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
