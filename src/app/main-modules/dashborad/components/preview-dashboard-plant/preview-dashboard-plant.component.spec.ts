import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewDashboardPlantComponent } from './preview-dashboard-plant.component';

describe('PreviewDashboardPlantComponent', () => {
  let component: PreviewDashboardPlantComponent;
  let fixture: ComponentFixture<PreviewDashboardPlantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewDashboardPlantComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewDashboardPlantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
