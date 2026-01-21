import { CUSTOM_ELEMENTS_SCHEMA, model } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListingComponent } from '.';
import { ClioInfo } from '../_models';

describe('ListingComponent', () => {
  let component: ListingComponent;
  let fixture: ComponentFixture<ListingComponent>;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [ListingComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: []
    }).compileComponents();
  };

  const b4Each = (): void => {
    configureTestbed();
    fixture = TestBed.createComponent(ListingComponent);
    component = fixture.componentInstance;

    TestBed.runInInjectionContext(() => {
      component.clioInfo = model({
        title: '',
        list: [],
        listLength: -1,
        listAverageScore: -1,
        filterOps: {}
      } as ClioInfo);
    });

    fixture.detectChanges();
    TestBed.flushEffects();
  };

  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
