import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateVacancyEventComponent } from './create-vacancy-event.component';

describe('CreateVacancyEventComponent', () => {
  let component: CreateVacancyEventComponent;
  let fixture: ComponentFixture<CreateVacancyEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateVacancyEventComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateVacancyEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
