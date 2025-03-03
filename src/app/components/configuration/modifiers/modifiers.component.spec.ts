import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifiersComponent } from './modifiers.component';

describe('ModifiersComponent', () => {
  let component: ModifiersComponent;
  let fixture: ComponentFixture<ModifiersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifiersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifiersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
