import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantResourcesComponent } from './plant-resources.component';

describe('PlantResourcesComponent', () => {
  let component: PlantResourcesComponent;
  let fixture: ComponentFixture<PlantResourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlantResourcesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
