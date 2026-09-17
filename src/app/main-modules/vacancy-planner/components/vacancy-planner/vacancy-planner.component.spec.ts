import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VacancyPlannerComponent } from './vacancy-planner.component';

describe('VacancyPlannerComponent', () => {
  let component: VacancyPlannerComponent;
  let fixture: ComponentFixture<VacancyPlannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VacancyPlannerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VacancyPlannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
