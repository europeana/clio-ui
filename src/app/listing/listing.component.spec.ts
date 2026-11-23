import { CUSTOM_ELEMENTS_SCHEMA, model } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ListingComponent } from '.';
import { CheckGroup, ClioCheck, ClioInfo } from '../_models';
import { APIService } from '../_services';

describe('ListingComponent', () => {
  let component: ListingComponent;
  let fixture: ComponentFixture<ListingComponent>;

  const clioInfo = {
    filterOps: {},
    list: [
      {
        id: 1,
        datasetId: '1'
      },
      {
        id: 2,
        datasetId: '2'
      }
    ] as unknown as Array<ClioCheck>,
    datasetChecks: {
      '1': {
        list: [
          {
            id: 1,
            date: '',
            datasetId: '1',
            datasetName: '1',
            dataProvider: '',
            provider: '',
            percentLinksInOperation: 0
          }
        ],
        opened: false,
        percentLinksInOperation: 0
      },
      '2': {
        list: [
          {
            id: 2,
            date: '',
            datasetId: '2',
            datasetName: '2',
            dataProvider: '',
            provider: '',
            percentLinksInOperation: 0
          }
        ],
        opened: false,
        percentLinksInOperation: 0
      }
    },
    listLength: 2,
    listAverageScore: 0,
    titleMarkup: []
  } as ClioInfo;

  const mockApiService = {
    getDatasetRuns: jest.fn().mockReturnValue(of([]))
  } as unknown as jest.Mocked<APIService>;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [ListingComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: APIService,
          useValue: mockApiService
        }
      ]
    }).compileComponents();
  };

  const b4Each = (): void => {
    jest.clearAllMocks();
    configureTestbed();
    fixture = TestBed.createComponent(ListingComponent);
    component = fixture.componentInstance;

    TestBed.runInInjectionContext(() => {
      component.clioInfo = model(structuredClone(clioInfo));
    });
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

  it('should toggle individual check row selections cleanly via independent state sets', () => {
    expect(component.selectedCheckIds().has(1)).toBeTruthy();
    component.toggleCheckSelection(1);
    expect(component.selectedCheckIds().has(1)).toBeFalsy();
    component.toggleCheckSelection(1);
    expect(component.selectedCheckIds().has(1)).toBeTruthy();
  });

  it('should handle clicks outside', () => {
    component.clioInfo.set({
      ...structuredClone(clioInfo),
      datasetChecks: {
        '1': {
          list: [
            {
              id: 101,
              date: '',
              datasetId: '1',
              datasetName: '1',
              dataProvider: '',
              provider: '',
              percentLinksInOperation: 0
            },
            {
              id: 102,
              date: '',
              datasetId: '1',
              datasetName: '1',
              dataProvider: '',
              provider: '',
              percentLinksInOperation: 0
            }
          ],
          opened: true,
          percentLinksInOperation: 0
        }
      }
    });
    component.selectedCheckIds.set(new Set([101, 102, 2]));
    expect(component.listSelectionCount()).toBe(3);

    component.clickOutside();

    expect(component.clioInfo().datasetChecks['1']?.opened).toBeFalsy();
    expect(component.selectedCheckIds().has(101)).toBeFalsy();
    expect(component.selectedCheckIds().has(102)).toBeFalsy();
    expect(component.selectedCheckIds().has(1)).toBeTruthy();
    expect(component.listSelectionCount()).toBe(2);
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

  it('should toggle selection states back and forth to cover all checkAll branch paths', () => {
    const datasetAList = component
      .clioInfo()
      .list.filter((r) => r.datasetId === '1');

    expect(component.selectedDatasetIds().has('1')).toBe(true);

    component.checkAll('1', datasetAList);
    expect(component.selectedDatasetIds().has('1')).toBe(false);
    expect(component.selectedCheckIds().has(1)).toBe(false);

    component.checkAll('1', datasetAList);
    expect(component.selectedDatasetIds().has('1')).toBe(true);
    expect(component.selectedCheckIds().has(1)).toBe(true);
  });

  it('should get the selected run count', () => {
    const list = component.clioInfo().list;

    expect(component.getSelectedRunCount(list)).toEqual(2);

    component.toggleCheckSelection(1);
    expect(component.getSelectedRunCount(list)).toEqual(1);

    component.toggleCheckSelection(2);
    expect(component.getSelectedRunCount(list)).toEqual(0);
  });

  it('should update the list selection count', () => {
    expect(component.listSelectionCount()).toEqual(2);

    component.toggleCheckSelection(1);
    expect(component.listSelectionCount()).toEqual(1);

    component.toggleCheckSelection(2);
    expect(component.listSelectionCount()).toEqual(0);
  });

  it('should uncheck sibling keys cleanly when shouldCheckAll evaluates to false', () => {
    const mockDatasetId = 'DS-99';
    const mockRuns = [{ id: 500 } as ClioCheck];

    component.selectedDatasetIds.set(new Set([mockDatasetId]));
    component.selectedCheckIds.set(new Set([500]));

    component.checkAll(mockDatasetId, mockRuns);

    expect(component.selectedDatasetIds().has(mockDatasetId)).toBe(false);
    expect(component.selectedCheckIds().has(500)).toBe(false);
  });

  it('should swap placeholder ID for fetched runs on open, restore on close, and reuse cached runs on re-open', () => {
    const mockApiRuns: ClioCheck[] = [
      {
        id: 1001,
        date: '2026-10-08',
        datasetId: '1',
        datasetName: 'Run 1',
        provider: 'N/A',
        dataProvider: 'N/A',
        percentLinksInOperation: 0
      },
      {
        id: 1002,
        date: '2026-10-07',
        datasetId: '1',
        datasetName: 'Run 2',
        provider: 'N/A',
        dataProvider: 'N/A',
        percentLinksInOperation: 0
      },
      {
        id: 1003,
        date: '2026-10-06',
        datasetId: '1',
        datasetName: 'Run 3',
        provider: 'N/A',
        dataProvider: 'N/A',
        percentLinksInOperation: 100
      }
    ];

    mockApiService.getDatasetRuns.mockReturnValue(of(mockApiRuns));

    const mockGroup: CheckGroup = {
      list: [
        {
          id: 1,
          date: '2026-10-08',
          datasetId: '1',
          datasetName: 'Dataset One',
          datasetSize: 3,
          provider: 'N/A',
          dataProvider: 'N/A',
          percentLinksInOperation: 80
        }
      ],
      opened: false,
      percentLinksInOperation: 80
    };

    // Initial count: dataset 1 (id: 1) + dataset 2 (id: 2)
    expect(component.listSelectionCount()).toBe(2);

    // 1. Open group -> fetches sub-runs and swaps id 1 for 1001, 1002, 1003
    component.toggleGroupOpenStatus('1', mockGroup);

    expect(mockGroup.opened).toBe(true);
    expect(mockApiService.getDatasetRuns).toHaveBeenCalledTimes(1);
    expect(mockApiService.getDatasetRuns).toHaveBeenCalledWith(
      '1',
      'Dataset One',
      'N/A',
      'N/A'
    );
    expect(mockGroup.list).toHaveLength(3);
    expect(mockGroup.list[0].datasetSize).toBe(3);
    expect(component.selectedCheckIds().has(1)).toBe(false);
    expect(component.selectedCheckIds().has(1001)).toBe(true);
    expect(component.listSelectionCount()).toBe(4); // 3 sub-runs + dataset 2

    // 2. Close group -> removes sub-run IDs and restores top-level id 1
    component.toggleGroupOpenStatus('1', mockGroup);

    expect(mockGroup.opened).toBe(false);
    expect(component.selectedCheckIds().has(1001)).toBe(false);
    expect(component.selectedCheckIds().has(1)).toBe(true);
    expect(component.listSelectionCount()).toBe(2);

    // 3. Re-open group -> uses cached runs without calling API again
    component.toggleGroupOpenStatus('1', mockGroup);

    expect(mockGroup.opened).toBe(true);
    expect(mockApiService.getDatasetRuns).toHaveBeenCalledTimes(1);
    expect(component.selectedCheckIds().has(1)).toBe(false);
    expect(component.selectedCheckIds().has(1001)).toBe(true);
    expect(component.listSelectionCount()).toBe(4);
  });

  it('should log an error when fetching sub-runs fails', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockApiService.getDatasetRuns.mockReturnValue(
      throwError(() => new Error('Network error'))
    );

    const mockGroup: CheckGroup = {
      list: [
        {
          id: 1,
          date: '2026-10-08',
          datasetId: '1',
          datasetName: 'Dataset One',
          provider: 'N/A',
          dataProvider: 'N/A',
          percentLinksInOperation: 80
        }
      ],
      opened: false,
      percentLinksInOperation: 80
    };

    component.toggleGroupOpenStatus('1', mockGroup);

    component.toggleGroupOpenStatus('1', mockGroup);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to resolve sub-runs for dataset: 1',
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });
});
