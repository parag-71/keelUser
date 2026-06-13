import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewPlantResourcesComponent } from './preview-plant-resources.component';

describe('PreviewPlantResourcesComponent', () => {
  let component: PreviewPlantResourcesComponent;
  let fixture: ComponentFixture<PreviewPlantResourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewPlantResourcesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewPlantResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
