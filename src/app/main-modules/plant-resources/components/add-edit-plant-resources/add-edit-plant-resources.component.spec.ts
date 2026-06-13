import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditPlantResourcesComponent } from './add-edit-plant-resources.component';

describe('AddEditPlantResourcesComponent', () => {
  let component: AddEditPlantResourcesComponent;
  let fixture: ComponentFixture<AddEditPlantResourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditPlantResourcesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditPlantResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
