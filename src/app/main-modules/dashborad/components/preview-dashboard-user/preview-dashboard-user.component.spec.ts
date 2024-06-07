import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewDashboardUserComponent } from './preview-dashboard-user.component';

describe('PreviewDashboardUserComponent', () => {
  let component: PreviewDashboardUserComponent;
  let fixture: ComponentFixture<PreviewDashboardUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewDashboardUserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewDashboardUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
