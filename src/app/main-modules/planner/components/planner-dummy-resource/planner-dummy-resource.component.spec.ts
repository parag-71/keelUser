import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannerDummyResourceComponent } from './planner-dummy-resource.component';

describe('PlannerDummyResourceComponent', () => {
  let component: PlannerDummyResourceComponent;
  let fixture: ComponentFixture<PlannerDummyResourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlannerDummyResourceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlannerDummyResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
