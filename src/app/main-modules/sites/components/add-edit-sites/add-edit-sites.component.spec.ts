import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditSitesComponent } from './add-edit-sites.component';

describe('AddEditSitesComponent', () => {
  let component: AddEditSitesComponent;
  let fixture: ComponentFixture<AddEditSitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditSitesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditSitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
