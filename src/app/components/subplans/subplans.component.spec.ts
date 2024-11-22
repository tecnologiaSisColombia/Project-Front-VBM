import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubplansComponent } from './subplans.component';

describe('SubplansComponent', () => {
  let component: SubplansComponent;
  let fixture: ComponentFixture<SubplansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubplansComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubplansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
