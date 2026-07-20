import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { FiltersComponent } from './filters.component';
import { APIService } from '../_services';
import { CheckDataResults } from '../_models';

describe('FiltersComponent', () => {
  let component: FiltersComponent;
  let fixture: ComponentFixture<FiltersComponent>;
  let router: Router;
  let queryParams$: BehaviorSubject<Params>;

  const createMockParamMap = (params: Record<string, string>) => ({
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

    it('should get the date as an ISO string', () => {
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

    it('should go to the page', () => {
      fixture.detectChanges();
      jest.spyOn(component, 'updatePageUrl').mockImplementation(() => {});
      component.form.patchValue({ offset: 50, limit: 25 });
      component.goToPage(2);
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

    it('should react to the page params (datasetName)', fakeAsync(() => {
      jest.spyOn(component, 'loadData').mockImplementation(() => {});
      component.ngOnInit();

      queryParams$.next({ datasetName: 'my_dataset' });
      tick(0);
      fixture.detectChanges();

      expect(component.loadData).toHaveBeenCalled();
    }));

    it('should react to the page params (datasetId)', fakeAsync(() => {
      jest.spyOn(component, 'loadData').mockImplementation(() => {});
      component.ngOnInit();

      queryParams$.next({ datasetId: '1' });
      tick(0);
      fixture.detectChanges();

      expect(component.loadData).toHaveBeenCalled();
    }));

    it('should react to individual and comma-separated datasetIds', fakeAsync(() => {
      jest.spyOn(component, 'loadData').mockImplementation(() => {});
      component.ngOnInit();

      queryParams$.next({ datasetId: '1,2' });
      tick(0);
      fixture.detectChanges();

      const datasetIdsGroup = component.form.get('datasetIds') as FormGroup;
      expect(datasetIdsGroup.contains('1')).toBe(true);
      expect(datasetIdsGroup.contains('2')).toBe(true);
    }));

    it('should add or update filter controls using expected casing format keys', () => {
      fixture.detectChanges();
      const ctrlProvider = component.form.controls.provider as FormGroup;

      expect(ctrlProvider.controls['A']).toBeFalsy();
      component.addOrUpdateFilterControls('provider', ['A', 'B']);
      expect(ctrlProvider.controls['A']).toBeTruthy();
    });

    it('should get the set checkbox values using correct form group control keys', () => {
      fixture.detectChanges();
      component.addOrUpdateFilterControls('provider', ['A', 'B']);
      const ctrlProvider = component.form.controls.provider as FormGroup;

      expect(component.getSetCheckboxValues('provider').length).toBe(0);
      ctrlProvider.controls['A'].setValue(true);
      expect(component.getSetCheckboxValues('provider')).toEqual(['A']);
    });

    it('should generate the title markup and trigger interactive filter removals with matched casing strings', () => {
      fixture.detectChanges();
      let markup = component.generateTitleMarkup();
      expect(markup[0].label).toBe('All checks');

      component.queryParams = {
        provider: ['A', 'B'],
        dataProvider: ['C', 'D'],
        datasetId: ['101'],
        datasetName: ['MyDataset'],
        dateFrom: ['Dec 12th'],
        dateTo: ['June 10th'],
        percentLinksInOperationFrom: ['60']
      };

      const providerGroup = component.form.get('provider') as FormGroup;
      const dataProviderGroup = component.form.get('dataProvider') as FormGroup;

      providerGroup.addControl('A', new FormControl(true));
      providerGroup.addControl('B', new FormControl(true));
      dataProviderGroup.addControl('C', new FormControl(true));
      dataProviderGroup.addControl('D', new FormControl(true));

      markup = component.generateTitleMarkup();

      expect(markup.map((m) => m.label).join(' ')).toEqual(
        'provider A or B and dataProvider C or D and Dataset Id (101) and Dataset Name "MyDataset" from Dec 12th until June 10th and Percent In Operation >= 60%'
      );

      jest.spyOn(component.form, 'patchValue');
      jest.spyOn(component, 'updatePageUrl').mockImplementation(() => {});

      markup.forEach((m: { fn?: () => void }) => {
        if (m.fn) m.fn();
      });

      expect(component.form.patchValue).toHaveBeenCalled();
    });
  });

  describe('Errors', () => {
    beforeEach(() => {
      configureTestbed(true);
      fixture = TestBed.createComponent(FiltersComponent);
      component = fixture.componentInstance;
    });

    it('should handle load errors gracefully', fakeAsync(() => {
      fixture.detectChanges();
      expect(component.error).toBeFalsy();
      component.loadData();
      tick(0);
      expect(component.error).toBeTruthy();
    }));
  });
});
