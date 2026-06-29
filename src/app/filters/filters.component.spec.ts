import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { UntypedFormGroup } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';
import { FiltersComponent } from '.';
import { APIService } from '../_services';
import { MockAPIService, MockAPIServiceErrors } from '../_mocked';

describe('FiltersComponent', () => {
  let component: FiltersComponent;
  let fixture: ComponentFixture<FiltersComponent>;
  let router: Router;

  const queryParams = new BehaviorSubject({} as Params);

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
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            snapshot: { queryParamMap: { get: (): void => {} } }
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
      jest.spyOn(component, 'updatePageUrl');
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
      jest.spyOn(router, 'navigate');
      component.ngOnInit();
      fixture.detectChanges();
      component.updatePageUrl();
      expect(router.navigate).toHaveBeenCalled();
    });

    it('should react to the page params (dataset-name)', fakeAsync(() => {
      jest.spyOn(component, 'loadData');
      component.ngOnInit();
      queryParams.next({});
      queryParams.next({ 'dataset-name': 'my_dataset' });
      tick(0);
      fixture.detectChanges();
      expect(component.loadData).toHaveBeenCalled();
    }));

    it('should react to the page params (datasetId)', fakeAsync(() => {
      jest.spyOn(component, 'loadData');
      component.ngOnInit();
      queryParams.next({});
      queryParams.next({ datasetId: '1' });
      tick(0);
      fixture.detectChanges();
      expect(component.loadData).toHaveBeenCalled();
    }));

    it('should react to the page params (datasetIds)', fakeAsync(() => {
      jest.spyOn(component, 'loadData');
      component.ngOnInit();
      queryParams.next({});
      queryParams.next({ datasetId: '1,2' });
      tick(0);
      fixture.detectChanges();
      expect(component.loadData).toHaveBeenCalled();
    }));

    it('should react to the page params (from-date)', fakeAsync(() => {
      jest.spyOn(component, 'loadData');
      component.ngOnInit();
      queryParams.next({});
      queryParams.next({ dateFrom: '2026-01-06' });
      tick(0);
      fixture.detectChanges();
      expect(component.loadData).toHaveBeenCalled();
    }));

    it('should react to the page params (to-date)', fakeAsync(() => {
      jest.spyOn(component, 'loadData');
      component.ngOnInit();
      queryParams.next({});
      queryParams.next({ dateTo: '2026-01-06' });
      tick(0);
      fixture.detectChanges();
      expect(component.loadData).toHaveBeenCalled();
    }));

    it('should react to the page params (provider)', fakeAsync(() => {
      jest.spyOn(component, 'loadData');
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
      jest.spyOn(component, 'loadData');
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
      jest.spyOn(router, 'navigate');
      component.updatePageUrl();
      expect(router.navigate).toHaveBeenCalled();
    }));

    it('should add or update filter controls', () => {
      const ctrlProvider = component.form.controls.provider as UntypedFormGroup;
      expect(ctrlProvider).toBeTruthy();
      expect(ctrlProvider.controls.A).toBeFalsy();
      component.addOrUpdateFilterControls('provider', ['A', 'B']);
      expect(ctrlProvider.controls.A).toBeTruthy();
    });

    it('should get the set checkbox values', () => {
      component.addOrUpdateFilterControls('provider', ['A', 'B']);
      const ctrlProvider = component.form.controls.provider as UntypedFormGroup;
      expect(component.getSetCheckboxValues('provider').length).toBeFalsy();
      ctrlProvider.controls.A.setValue(true);
      expect(component.getSetCheckboxValues('provider').length).toBeTruthy();
    });

    it('should generate the title markup', () => {
      let markup = component.generateTitleMarkup();

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

      markup = component.generateTitleMarkup();
      expect(markup.map((m) => m.label).join(' ')).toEqual(
        `${clause1} and ${clause2} and ${clause3} and ${clause4} ${clause5} ${clause6} and ${clause7}`
      );
      jest.spyOn(component.form, 'patchValue');
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

    it('should handle load errors', fakeAsync(() => {
      expect(component.error).toBeFalsy();
      component.loadData();
      tick(1);
      expect(component.error).toBeTruthy();
    }));
  });
});
