import { CUSTOM_ELEMENTS_SCHEMA, model } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { ListingComponent } from '.';
import { ClioInfo, Run } from '../_models';

describe('ListingComponent', () => {
  let component: ListingComponent;
  let fixture: ComponentFixture<ListingComponent>;

  const clioInfo = {
    filterOps: {},
    list: [
      {
        runId: 1,
        datasetId: '1'
      },
      {
        runId: 2,
        datasetId: '2'
      }
    ] as unknown as Array<Run>,
    datasetRuns: {
      '1': {
        list: [
          {
            runId: 1,
            creationTime: '',
            datasetId: '1',
            datasetName: '1',
            dataProvider: '',
            provider: '',
            percentInOperation: 0
          }
        ],
        opened: true,
        percentInOperation: 0
      },
      '2': {
        list: [
          {
            runId: 2,
            creationTime: '',
            datasetId: '2',
            datasetName: '2',
            dataProvider: '',
            provider: '',
            percentInOperation: 0
          }
        ],
        opened: true,
        percentInOperation: 0
      }
    },
    listLength: 2,
    listAverageScore: 0,
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

    TestBed.flushEffects();
    fixture.detectChanges();
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
    const cmp = component.form.controls.run_ids as FormGroup;

    expect(cmp.value['1']).toBeTruthy();
    component.setRunCheckboxes(false);
    expect(cmp.value['1']).toBeFalsy();
    component.setRunCheckboxes(true);
    expect(cmp.value['1']).toBeTruthy();
  });

  it('should handle clicks outside', () => {
    component.clioInfo.set({
      ...structuredClone(clioInfo),
      datasetRuns: {
        '1': {
          list: [
            {
              runId: 0,
              creationTime: '',
              datasetId: '1',
              datasetName: '1',
              dataProvider: '',
              provider: '',
              percentInOperation: 0
            }
          ],
          opened: true,
          percentInOperation: 0
        }
      }
    });
    TestBed.flushEffects();

    expect(component.clioInfo().datasetRuns['1']?.opened).toBeTruthy();
    component.clickOutside();
    expect(component.clioInfo().datasetRuns['1']?.opened).toBeFalsy();
  });

  it('should cancel the graph mode', () => {
    component.graphMode = true;
    component.cancelGraphMode();
    expect(component.graphMode).toBeFalsy();
  });

  it('should toggle the graph mode', () => {
    expect(component.graphMode).toBeFalsy();
    component.toggleGraphMode();
    expect(component.graphMode).toBeTruthy();
    component.toggleGraphMode();
    expect(component.graphMode).toBeFalsy();
  });

  it('should check all', () => {
    jest.spyOn(component, 'updateIds');
    component.checkAll('1', []);
    expect(component.updateIds).toHaveBeenCalled();
  });

  it('should get the selected run count', fakeAsync(() => {
    const list = component.clioInfo().list;

    expect(component.getSelectedRunCount(list)).toEqual(2);

    component.form.patchValue({ run_ids: { '1': false } });
    expect(component.getSelectedRunCount(list)).toEqual(1);

    component.form.patchValue({ run_ids: { '2': false } });
    expect(component.getSelectedRunCount(list)).toEqual(0);
  }));

  it('should update the list selection count', () => {
    expect(component.listSelectionCount).toEqual(2);
    component.form.setValue({ run_ids: { '1': false, '2': true } });
    expect(component.listSelectionCount).toEqual(2);
    component.updateIds();
    expect(component.listSelectionCount).toEqual(1);

    component.form.setValue({ run_ids: { '1': false, '2': false } });
    expect(component.listSelectionCount).toEqual(1);
    component.updateIds();
    expect(component.listSelectionCount).toEqual(0);
  });
});
