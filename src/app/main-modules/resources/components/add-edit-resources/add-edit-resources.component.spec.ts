import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditResourcesComponent } from './add-edit-resources.component';

describe('AddEditResourcesComponent', () => {
  let component: AddEditResourcesComponent;
  let fixture: ComponentFixture<AddEditResourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditResourcesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
