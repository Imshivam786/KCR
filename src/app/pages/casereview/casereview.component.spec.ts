import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasereviewComponent } from './casereview.component';

describe('CasereviewComponent', () => {
  let component: CasereviewComponent;
  let fixture: ComponentFixture<CasereviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CasereviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CasereviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
