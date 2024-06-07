import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteUserPreviewComponent } from './site-user-preview.component';

describe('SiteUserPreviewComponent', () => {
  let component: SiteUserPreviewComponent;
  let fixture: ComponentFixture<SiteUserPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteUserPreviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteUserPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
