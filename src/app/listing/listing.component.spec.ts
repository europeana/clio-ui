import { CUSTOM_ELEMENTS_SCHEMA, model } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ListingComponent } from '.';
import { ClioCheck, ClioInfo } from '../_models';
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
        opened: true,
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
        opened: true,
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
              id: 0,
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
    expect(component.clioInfo().datasetChecks['1']?.opened).toBeTruthy();
    component.clickOutside();
    expect(component.clioInfo().datasetChecks['1']?.opened).toBeFalsy();
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

  it('should check all and toggle selection states', () => {
    const datasetAList = component
      .clioInfo()
      .list.filter((r) => r.datasetId === '1');

    // Initial state: '1' is in the dataset group check set
    expect(component.selectedDatasetIds().has('1')).toBeTruthy();

    // Action: Deselect group '1'
    component.checkAll('1', datasetAList);
    expect(component.selectedDatasetIds().has('1')).toBeFalsy();
    expect(component.selectedCheckIds().has(1)).toBeFalsy();
  });

  it('should get the selected run count', () => {
    const list = component.clioInfo().list;

    expect(component.getSelectedRunCount(list)).toEqual(2);

    // Toggle off individual check IDs instead of mutating form values
    component.toggleCheckSelection(1);
    expect(component.getSelectedRunCount(list)).toEqual(1);

    component.toggleCheckSelection(2);
    expect(component.getSelectedRunCount(list)).toEqual(0);
  });

  it('should update the list selection count', () => {
    expect(component.listSelectionCount).toEqual(2);

    // Toggle off individual check nodes directly via state management signals
    component.toggleCheckSelection(1);
    expect(component.listSelectionCount).toEqual(1);

    component.toggleCheckSelection(2);
    expect(component.listSelectionCount).toEqual(0);
  });

  it('should calculate accurate timestamp strings inside shiftDate utilities', () => {
    const shifted = (component as any).shiftDate('2026-01-15T00:00:00.000Z', 5);
    expect(shifted).toBe('2026-01-20');
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

  it('should toggle group open status and load expanded runs from the API service', () => {
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

    // Inject the mock array into the spy stream
    mockApiService.getDatasetRuns.mockReturnValue(of(mockApiRuns));

    const mockGroup = {
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

    expect(mockGroup.opened).toBe(true);

    expect(mockApiService.getDatasetRuns).toHaveBeenCalledWith(
      '1',
      'Dataset One',
      'N/A',
      'N/A'
    );

    expect(mockGroup.list).toHaveLength(3);
    expect(mockGroup.list[0].id).toBe(1001);
    expect(mockGroup.list[1].id).toBe(1002);
    expect(mockGroup.list[2].id).toBe(1003);
  });
});
