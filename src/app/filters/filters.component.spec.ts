import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { FiltersComponent } from './filters.component';
import { APIService } from '../_services';
import { CheckDataResults, ClioInfo } from '../_models';

describe('FiltersComponent', () => {
  let component: FiltersComponent;
  let fixture: ComponentFixture<FiltersComponent>;
  let router: Router;
  let queryParams$: BehaviorSubject<Params>;

  const createMockParamMap = (params: Record<string, string>): ParamMap => ({
    has: (key: string) => key in params,
    get: (key: string) => params[key] || null,
    getAll: (key: string) => (params[key] ? [params[key]] : []),
    keys: Object.keys(params)
  });

  const mockApiService = {
    getFilteredClioChecks: jest.fn().mockReturnValue(
      of({
        results: [],
        filterOptions: { provider: ['A', 'B'], dataProvider: ['C', 'D'] }
      } as unknown as CheckDataResults)
    ),
    groupChecksByDatasetId: jest.fn().mockReturnValue({})
  };

  const configureTestbed = (throwErrorMode = false): void => {
    queryParams$ = new BehaviorSubject<Params>({});

    if (throwErrorMode) {
      mockApiService.getFilteredClioChecks.mockReturnValue(
        throwError(
          () => new HttpErrorResponse({ error: 'Network Error', status: 500 })
        )
      );
    } else {
      mockApiService.getFilteredClioChecks.mockReturnValue(
        of({
          results: [],
          filterOptions: { provider: ['A', 'B'], dataProvider: ['C', 'D'] }
        } as unknown as CheckDataResults)
      );
    }

    TestBed.configureTestingModule({
      imports: [FiltersComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParams$,
            snapshot: {
              queryParamMap: createMockParamMap({
                percentLinksInOperationFrom: '40'
              })
            }
          }
        },
        {
          provide: APIService,
          useValue: mockApiService
        },
        {
          provide: Router,
          useValue: {
            navigate: jest.fn().mockResolvedValue(true)
          }
        }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
  };

  describe('Normal Operations', () => {
    beforeEach(() => {
      configureTestbed(false);
      fixture = TestBed.createComponent(FiltersComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should initialise', async () => {
      jest.spyOn(component, 'loadData').mockImplementation(() => undefined);
      component.ngOnInit();
      queryParams$.next({
        percentLinksInOperationFrom: ['85'],
        limit: 50,
        offset: NaN,
        datasetId: '999, 888',
        dateFrom: undefined,
        dateTo: ['2026-12-31']
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      fixture.detectChanges();

      const datasetIdsGroup = component.form.get('datasetIds') as FormGroup;
      expect(datasetIdsGroup.contains('999')).toBe(true);
      expect(datasetIdsGroup.contains('888')).toBe(true);
      expect(component.loadData).toHaveBeenCalled();
    });

    it('should cover the server request mapping data translation fallback branches', () => {
      fixture.detectChanges();

      component.form.patchValue({
        percentLinksInOperationFrom: null,
        offset: null,
        limit: null,
        datasetId: '',
        dateFrom: null,
        dateTo: null
      });

      const req = component.getDataServerDataRequest();
      expect(req.filters.percentLinksInOperationFrom).toBe(0);
      expect(req.filters.offset).toBe(0);
      expect(req.filters.limit).toBe(25);
    });

    it('should parse explicit criteria values inside getDataServerDataRequest safely', () => {
      component.form.patchValue({
        datasetId: '71, 72',
        datasetName: 'ArchiveExpress',
        percentLinksInOperationFrom: 40
      });

      const requestPayload = component.getDataServerDataRequest();

      expect(requestPayload.filters['datasetId']).toEqual(['71', '72']);
      expect(requestPayload.filters['datasetName']).toEqual(['ArchiveExpress']);
    });

    it('should updatePageUrl', () => {
      fixture.detectChanges();
      jest.spyOn(router, 'navigate').mockResolvedValue(true);

      component.form.patchValue({
        dateFrom: '2026-07-20',
        dateTo: '2026-07-21',
        datasetId: '321',
        datasetName: 'TargetDataset',
        percentLinksInOperationFrom: 0,
        limit: 10,
        offset: 5
      });

      component.updatePageUrl(false);
      expect(router.navigate).toHaveBeenCalled();
    });

    it('should updatePageUrl with clearPagination reset path verified', () => {
      fixture.detectChanges();
      jest.spyOn(router, 'navigate').mockResolvedValue(true);
      component.form.patchValue({ offset: 50 });

      component.updatePageUrl(true);
      expect(component.form.value.offset).toBe(0);
      expect(router.navigate).toHaveBeenCalled();
    });

    it('should get the date as an ISO string split array signature match', () => {
      fixture.detectChanges();
      const inputDate = new Date('2026-06-24T12:00:00');
      const result = component.getDateAsISOString(inputDate);
      expect(result).toContain('2026-06-24');
    });

    it('should decrement offset by the limit value', () => {
      fixture.detectChanges();
      component.dropPage();
      expect(component.form.value.offset).toBe(0);
      component.form.patchValue({ offset: 50, limit: 25 });
      component.dropPage();
      expect(component.form.value.offset).toBe(25);
    });

    it('should go to the target page via limit calculation sets', () => {
      fixture.detectChanges();
      jest
        .spyOn(component, 'updatePageUrl')
        .mockImplementation(() => undefined);
      component.form.patchValue({ offset: 50, limit: 25 });
      component.goToPage(2);
      expect(component.form.value.offset).toBe(50);
      expect(component.updatePageUrl).toHaveBeenCalled();
    });

    it('should increment offset by the limit value', () => {
      fixture.detectChanges();
      component.form.patchValue({ offset: 0, limit: 25 });
      component.bumpPage();
      expect(component.form.value.offset).toBe(25);
    });

    it('should update the page location', () => {
      fixture.detectChanges();
      component.updatePageUrl();
      expect(router.navigate).toHaveBeenCalled();
    });

    it('should react to the page params (datasetName)', async () => {
      jest.spyOn(component, 'loadData').mockImplementation(() => undefined);
      component.ngOnInit();

      queryParams$.next({ datasetName: 'my_dataset' });

      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      expect(component.loadData).toHaveBeenCalled();
    });

    it('should react to the page params (datasetId)', async () => {
      jest.spyOn(component, 'loadData').mockImplementation(() => undefined);
      component.ngOnInit();

      queryParams$.next({ datasetId: '1' });

      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      expect(component.loadData).toHaveBeenCalled();
    });

    it('should react to individual and comma-separated datasetIds', async () => {
      jest.spyOn(component, 'loadData').mockImplementation(() => undefined);
      component.ngOnInit();

      queryParams$.next({ datasetId: '1,2' });

      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      const datasetIdsGroup = component.form.get('datasetIds') as FormGroup;
      expect(datasetIdsGroup.contains('1')).toBe(true);
      expect(datasetIdsGroup.contains('2')).toBe(true);
    });

    it('should determine if a checkbox is checked based on routing query parameters', () => {
      queryParams$.next({ provider: 'AthenaPlus' });
      expect(component.isCheckboxChecked('provider', 'AthenaPlus')).toBe(true);
      expect(component.isCheckboxChecked('provider', 'CultureGrid')).toBe(
        false
      );

      queryParams$.next({ provider: ['AthenaPlus', 'CultureGrid'] });
      expect(component.isCheckboxChecked('provider', 'CultureGrid')).toBe(true);
      expect(component.isCheckboxChecked('provider', 'AthenaPlus')).toBe(true);
      expect(component.isCheckboxChecked('provider', 'Bulgariana')).toBe(false);

      queryParams$.next({});
      expect(component.isCheckboxChecked('provider', 'AthenaPlus')).toBe(false);
    });

    it('should generate the title markup and trigger interactive filter removals via switch mapping loops', () => {
      fixture.detectChanges();

      queryParams$.next({});
      let markup = component.generateTitleMarkup();
      expect(markup[0].label).toBe('All checks');

      queryParams$.next({
        provider: ['A', 'B'],
        dataProvider: ['C', 'D'],
        datasetId: ['101'],
        datasetName: ['MyDataset'],
        dateFrom: ['Dec 12th'],
        dateTo: ['June 10th'],
        percentLinksInOperationFrom: ['60']
      });

      markup = component.generateTitleMarkup();

      expect(markup.map((m) => m.label).join(' ')).toEqual(
        'provider A or B and dataProvider C or D and Dataset Id (101) ' +
          'and Dataset Name "MyDataset" from Dec 12th until June 10th ' +
          'and Percent In Operation >= 60%'
      );

      jest.spyOn(component.form, 'patchValue');
      jest.spyOn(router, 'navigate');

      markup.forEach((m: { fn?: () => void }) => {
        if (m.fn) m.fn();
      });

      expect(component.form.patchValue).toHaveBeenCalled();
    });

    it('should evaluate title markup parsing edge cases for all individual fields', () => {
      fixture.detectChanges();

      queryParams$.next({ dateFrom: ['2026-01-01'] });
      let markup = component.generateTitleMarkup();
      expect(markup.some((m) => m.label?.includes('from'))).toBe(true);

      queryParams$.next({ dateTo: ['2026-01-02'] });
      markup = component.generateTitleMarkup();
      expect(markup.some((m) => m.label?.includes('until'))).toBe(true);

      queryParams$.next({ datasetId: ['XYZ'] });
      markup = component.generateTitleMarkup();
      expect(markup.some((m) => m.label?.includes('Dataset Id'))).toBe(true);

      queryParams$.next({ percentLinksInOperationFrom: ['50'] });
      markup = component.generateTitleMarkup();
      expect(
        markup.some((m) => m.label?.includes('Percent In Operation'))
      ).toBe(true);
    });

    it('should handle all toggle combinations onFilterCheckboxToggle including removals and property deletion', () => {
      queryParams$.next({});

      component.onFilterCheckboxToggle('provider', 'Z');

      expect(router.navigate).toHaveBeenCalledWith(
        [],
        expect.objectContaining({
          queryParams: expect.objectContaining({
            provider: ['Z'],
            offset: 0
          })
        })
      );

      queryParams$.next({ provider: ['Z'] });

      component.onFilterCheckboxToggle('provider', 'Z');

      expect(router.navigate).toHaveBeenCalledWith(
        [],
        expect.objectContaining({
          queryParams: expect.objectContaining({
            offset: 0
          })
        })
      );

      const lastCallArgs = (router.navigate as jest.Mock).mock.calls;
      const lastQueryParams =
        lastCallArgs[lastCallArgs.length - 1][1].queryParams;
      expect(lastQueryParams.provider).toBeUndefined();
    });

    it('should update the target optionFilters dictionary property when search text is typed', () => {
      const mockEvent = {
        target: { value: 'Athena' }
      } as unknown as Event;
      component.updateOptionFilter('provider', mockEvent);
      expect(component.optionFilters()['provider']).toBe('Athena');
    });

    it('should reactively filter list options based on user text search updates', () => {
      component.modelClioInfo.set({
        filterOps: { provider: ['Netherlands', 'Belgium', 'Germany'] }
      } as unknown as ClioInfo);

      component.optionFilters.set({ provider: 'lands', dataProvider: '' });
      fixture.detectChanges();

      const output = component.sortedFilterOptions();
      expect(output['provider']).toEqual(['Netherlands']);
    });

    it('should guarantee that checked options float seamlessly to the top of the computed array output', () => {
      component.modelClioInfo.set({
        filterOps: { provider: ['Netherlands', 'Belgium', 'Germany'] }
      } as unknown as ClioInfo);

      queryParams$.next({ provider: 'Germany' });
      fixture.detectChanges();

      const output = component.sortedFilterOptions();
      expect(output['provider'][0]).toBe('Germany');
    });
  });

  describe('Errors', () => {
    beforeEach(() => {
      configureTestbed(true);
      fixture = TestBed.createComponent(FiltersComponent);
      component = fixture.componentInstance;
    });

    it('should handle load errors gracefully', async () => {
      fixture.detectChanges();
      expect(component.error).toBeFalsy();
      component.loadData();
      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();
      expect(component.error).toBeTruthy();
    });
  });
});
