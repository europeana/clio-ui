import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportItem } from '../_models';
import { ReportComponent } from '.';

describe('ReportComponent', () => {
  let component: ReportComponent;
  let fixture: ComponentFixture<ReportComponent>;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [ReportComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  };

  const b4Each = (): void => {
    configureTestbed();
    fixture = TestBed.createComponent(ReportComponent);
    component = fixture.componentInstance;
  };

  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should nav', () => {
    expect(component.index).toEqual(0);
    component.nav(1);
    expect(component.index).toEqual(0);
    component.report = [] as Array<ReportItem>;
    expect(component.index).toEqual(0);
    component.nav(-1);
    expect(component.index).toEqual(0);
    component.nav(1);
    expect(component.index).toEqual(0);
  });
});
