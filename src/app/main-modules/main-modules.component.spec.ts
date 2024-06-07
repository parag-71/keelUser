import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainModulesComponent } from './main-modules.component';

describe('MainModulesComponent', () => {
  let component: MainModulesComponent;
  let fixture: ComponentFixture<MainModulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainModulesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainModulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
