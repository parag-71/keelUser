import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftSiteMenuComponent } from './left-site-menu.component';

describe('LeftSiteMenuComponent', () => {
  let component: LeftSiteMenuComponent;
  let fixture: ComponentFixture<LeftSiteMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeftSiteMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeftSiteMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
