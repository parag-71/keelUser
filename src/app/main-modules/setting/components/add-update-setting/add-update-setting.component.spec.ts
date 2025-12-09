import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateSettingComponent } from './add-update-setting.component';

describe('AddUpdateSettingComponent', () => {
  let component: AddUpdateSettingComponent;
  let fixture: ComponentFixture<AddUpdateSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpdateSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdateSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
