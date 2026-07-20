import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { FiltersComponent } from './filters.component';
import { APIService } from '../_services';
import { MockAPIService, MockAPIServiceErrors } from '../_mocked';

describe('FiltersComponent', () => {
  let component: FiltersComponent;
  let fixture: ComponentFixture<FiltersComponent>;
  let router: Router;

  const queryParams = new BehaviorSubject({} as Params);

  const createMockParamMap = (
    params: Record<string, string>
  ): {
    has: (key: string) => boolean;
    get: (key: string) => string | null;
    getAll: (key: string) => string[];
    keys: string[];
  } => ({
    has: (key: string) => key in params,
    get: (key: string) => params[key] || null,
    getAll: (key: string) => (params[key] ? [params[key]] : []),
    keys: Object.keys(params)
  });

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [FiltersComponent, RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: {},
            queryParams,
            snapshot: {
              queryParamMap: createMockParamMap({
                percentLinksInOperationFrom: '40'
              })
            }
          }
        },
        {
          provide: APIService,
          useClass: errorMode ? MockAPIServiceErrors : MockAPIService
        }
      ]
    }).compileComponents();
    router = TestBed.inject(Router);
  };

  describe('Normal Operations', () => {
    const b4Each = (): void => {
      configureTestbed();
      fixture = TestBed.createComponent(FiltersComponent);
      component = fixture.componentInstance;
    };

    beforeEach(b4Each);

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should get the date as an ISO string', () => {
      const inputDate = new Date('2026-06-24T12:00:00');
      const result = component.getDateAsISOString(inputDate);
      expect(result).toBe('2026-06-24');
    });

    it('should decrement offset by the limit value', () => {
      component.dropPage();
      expect(component.form.value.offset).toBe(0);
      component.form.patchValue({ offset: 50, limit: 25 });
      component.dropPage();
      expect(component.form.value.offset).toBe(25);
    });

    it('should go to the page', () => {
      jest.spyOn(component, 'updatePageUrl').mockImplementation(() => {});
      component.form.patchValue({ offset: 50, limit: 25 });
      component.goToPage(2);
      expect(component.updatePageUrl).toHaveBeenCalled();
    });

    it('should increment offset by the limit value', () => {
      component.bumpPage();
      expect(component.form.value.offset).toBe(25);

      component.form.patchValue({ offset: 25, limit: 25 });
      component.bumpPage();
      expect(component.form.value.offset).toBe(50);
    });

    it('should update the page location', () => {
      jest
        .spyOn(router, 'navigate')
        .mockImplementation(() => Promise.resolve(true));
      component.ngOnInit();
      fixture.detectChanges();
      component.updatePageUrl();
      expect(router.navigate).toHaveBeenCalled();
    });

    it('should react to the page params (dataset-name)', fakeAsync(() => {
      jest.spyOn(component, 'loadData').mockImplementation(() => {});
      component.ngOnInit();
      queryParams.next({});
      queryParams.next({ 'dataset-name': 'my_dataset' });
      tick(0);
      fixture.detectChanges();
      expect(component.loadData).toHaveBeenCalled();
    }));

    it('should react to the page params (datasetId)', fakeAsync(() => {
      jest.spyOn(component, 'loadData').mockImplementation(() => {});
      component.ngOnInit();
      queryParams.next({});
      queryParams.next({ datasetId: '1' });
      tick(0);
      fixture.detectChanges();
      expect(component.loadData).toHaveBeenCalled();
    }));

    it('should react to the page params (datasetIds)', fakeAsync(() => {
      jest.spyOn(component, 'loadData').mockImplementation(() => {});
      component.ngOnInit();
      queryParams.next({});
      queryParams.next({ datasetId: '1,2' });
      tick(0);
      fixture.detectChanges();
      expect(component.loadData).toHaveBeenCalled();
    }));

    it('should react to the page params (from-date)', fakeAsync(() => {
      jest.spyOn(component, 'loadData').mockImplementation(() => {});
      component.ngOnInit();
      queryParams.next({});
      queryParams.next({ dateFrom: '2026-01-06' });
      tick(0);
      fixture.detectChanges();
      expect(component.loadData).toHaveBeenCalled();
    }));

    it('should react to the page params (to-date)', fakeAsync(() => {
      jest.spyOn(component, 'loadData').mockImplementation(() => {});
      component.ngOnInit();
      queryParams.next({});
      queryParams.next({ dateTo: '2026-01-06' });
      tick(0);
      fixture.detectChanges();
      expect(component.loadData).toHaveBeenCalled();
    }));

    it('should react to the page params (provider)', fakeAsync(() => {
      jest.spyOn(component, 'loadData').mockImplementation(() => {});
      component.ngOnInit();
      queryParams.next({});
      queryParams.next({
        provider: ['My Provider', 'His Provider', 'Her Provider']
      });
      tick(1);
      fixture.detectChanges();
      expect(component.loadData).toHaveBeenCalled();
    }));

    it('should react to the page params (dataProvider)', fakeAsync(() => {
      jest.spyOn(component, 'loadData').mockImplementation(() => {});
      component.ngOnInit();
      queryParams.next({});
      queryParams.next({
        dataProvider: ['Data Provider']
      });
      tick(1);
      fixture.detectChanges();
      expect(component.loadData).toHaveBeenCalled();
    }));

    it('should update the page url', fakeAsync(() => {
      component.ngOnInit();
      queryParams.next({});
      queryParams.next({
        provider: ['A', 'B'],
        dateFrom: '19:12:76',
        dateTo: '19:12:77',
        datasetId: '1',
        datasetName: 'my_dataset'
      });
      tick(1);
      fixture.detectChanges();
      jest
        .spyOn(router, 'navigate')
        .mockImplementation(() => Promise.resolve(true));
      component.updatePageUrl();
      expect(router.navigate).toHaveBeenCalled();
    }));

    it('should add or update filter controls', () => {
      const ctrlProvider = component.form.controls.provider as FormGroup;
      expect(ctrlProvider).toBeTruthy();
      expect(ctrlProvider.controls['A']).toBeFalsy();
      component.addOrUpdateFilterControls('provider', ['A', 'B']);
      expect(ctrlProvider.controls['A']).toBeTruthy();
    });

    it('should get the set checkbox values', () => {
      component.addOrUpdateFilterControls('provider', ['A', 'B']);
      const ctrlProvider = component.form.controls.provider as FormGroup;
      expect(component.getSetCheckboxValues('provider').length).toBeFalsy();
      ctrlProvider.controls['A'].setValue(true);
      expect(component.getSetCheckboxValues('provider').length).toBeTruthy();
    });

    it('should generate the title markup and trigger interactive filter removals', () => {
      let markup = component.generateTitleMarkup();
      expect(markup[0].label).toBe('All checks');

      const clause1 = 'provider A or B';
      const clause2 = 'dataProvider C or D';
      const clause3 = 'Dataset Id (101)';
      const clause4 = 'Dataset Name "MyDataset"';
      const clause5 = 'from Dec 12th';
      const clause6 = 'until June 10th';
      const clause7 = 'Percent In Operation >= 60%';

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
      providerGroup.addControl('a', component.form.controls.dateFrom);
      providerGroup.addControl('b', component.form.controls.dateFrom);
      dataProviderGroup.addControl('c', component.form.controls.dateFrom);
      dataProviderGroup.addControl('d', component.form.controls.dateFrom);

      markup = component.generateTitleMarkup();

      expect(markup.map((m) => m.label).join(' ')).toEqual(
        `${clause1} and ${clause2} and ${clause3} and ${clause4} ${clause5} ${clause6} and ${clause7}`
      );

      jest.spyOn(component.form, 'patchValue');
      jest.spyOn(component, 'updatePageUrl').mockImplementation(() => {});

      markup.forEach((m: { fn?: () => void }) => {
        if (m.fn) {
          m.fn();
        }
      });

      expect(component.form.patchValue).toHaveBeenCalledTimes(9);
    });
  });

  describe('Errors', () => {
    const b4Each = (): void => {
      configureTestbed(true);
      fixture = TestBed.createComponent(FiltersComponent);
      component = fixture.componentInstance;
    };

    beforeEach(b4Each);

    it('should handle load errors gracefully', fakeAsync(() => {
      expect(component.error).toBeFalsy();
      component.loadData();
      tick(1);
      expect(component.error).toBeTruthy();
    }));
  });
});
