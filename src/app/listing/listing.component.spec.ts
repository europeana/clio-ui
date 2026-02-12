import { CUSTOM_ELEMENTS_SCHEMA, model } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { ListingComponent } from '.';
import { ClioInfo, Run } from '../_models';

describe('ListingComponent', () => {
  let component: ListingComponent;
  let fixture: ComponentFixture<ListingComponent>;

  const clioInfo = {
    filterOps: {},
    list: [],
    datasetRuns: {},
    listLength: -1,
    listAverageScore: -1,
    titleMarkup: []
  } as ClioInfo;

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
      component.clioInfo = model(structuredClone(clioInfo));
    });

    fixture.detectChanges();
    TestBed.flushEffects();
  };

  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get the clio class', () => {
    expect(component.getClioClass(100)).toEqual('clio-state-4');
    expect(component.getClioClass(99)).toEqual('clio-state-4');
    expect(component.getClioClass(80)).toEqual('clio-state-4');
    expect(component.getClioClass(79)).toEqual('clio-state-3');
    expect(component.getClioClass(59)).toEqual('clio-state-2');
    expect(component.getClioClass(39)).toEqual('clio-state-1');
    expect(component.getClioClass(19)).toEqual('clio-state-0');
  });

  it('should set the checkboxes', () => {
    component.clioInfo.set({
      ...structuredClone(clioInfo),
      list: [
        {
          runId: '1'
        } as unknown as Run
      ]
    });
    TestBed.flushEffects();
    fixture.detectChanges();

    const cmp = component.form.controls.run_ids as FormGroup;

    expect(cmp.value['1']).toBeTruthy();
    component.setRunCheckboxes(false);
    expect(cmp.value['1']).toBeFalsy();
    component.setRunCheckboxes(true);
    expect(cmp.value['1']).toBeTruthy();
  });

  it('should update the list selection count', () => {
    expect(component.listSelectionCount).toEqual(0);

    component.clioInfo.set({
      ...structuredClone(clioInfo),
      list: [
        {
          runId: '1'
        } as unknown as Run
      ]
    });

    TestBed.flushEffects();
    fixture.detectChanges();

    component.form.setValue({ run_ids: { '1': true } });
    expect(component.listSelectionCount).toEqual(1);

    component.form.setValue({ run_ids: { '1': false } });
    expect(component.listSelectionCount).toEqual(1);

    component.updateIds();
    expect(component.listSelectionCount).toEqual(0);
  });
});
