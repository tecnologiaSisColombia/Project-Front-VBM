import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocalitiesComponent } from './localities.component';

describe('LocalitiesComponent', () => {
  let component: LocalitiesComponent;
  let fixture: ComponentFixture<LocalitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocalitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
