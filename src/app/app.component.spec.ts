import {
  CUSTOM_ELEMENTS_SCHEMA,
  signal,
  Signal,
  WritableSignal
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

import {
  MockAPIService,
  MockAPIServiceErrors,
  MockFiltersComponent
} from './_mocked';
import { ClioCheck } from './_models';
import { APIService, ClickService } from './_services';

import { AppComponent } from './app.component';
import { FiltersComponent } from './filters';

describe('AppComponent', () => {
  let clicks: ClickService;
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let api: APIService;
  let mockQueryParams$: BehaviorSubject<Params>;

  let mockFilters: {
    hasMoreAvailable: WritableSignal<boolean>;
    form: FormGroup;
    getDataServerDataRequest: jest.Mock;
    dropPage: jest.Mock;
    bumpPage: jest.Mock;
  };

  let mockListing: {
    form: FormGroup;
    clioInfo: WritableSignal<Record<string, unknown>>;
    selectedCheckIds: Signal<Set<number>>;
    selectedDatasetIds: Signal<Set<string>>;
  };

  const formVals = {
    value: { check_ids: ['1'], offset: 0, limit: 5 }
  } as unknown as FormGroup;

  const configureTestbed = (errorMode = false): void => {
    mockQueryParams$ = new BehaviorSubject<Params>({ offset: 0, limit: 25 });

    TestBed.configureTestingModule({
      imports: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: APIService,
          useClass: errorMode ? MockAPIServiceErrors : MockAPIService
        },
        { provide: ActivatedRoute, useValue: { queryParams: mockQueryParams$ } }
      ]
    })
      .overrideComponent(AppComponent, {
        remove: { imports: [FiltersComponent] },
        add: { imports: [MockFiltersComponent] }
      })
      .compileComponents();

    api = TestBed.inject(APIService);
    clicks = TestBed.inject(ClickService);
  };

  describe('Normal Operations', () => {
    beforeEach((): void => {
      configureTestbed();
      fixture = TestBed.createComponent(AppComponent);
      app = fixture.componentInstance;

      mockFilters = {
        hasMoreAvailable: signal(false),
        form: formVals,
        getDataServerDataRequest: jest.fn().mockReturnValue({ filters: {} }),
        dropPage: jest.fn(),
        bumpPage: jest.fn()
      };

      mockListing = {
        form: formVals,
        clioInfo: signal({ datasetChecks: {} }),
        selectedCheckIds: signal(new Set<number>()),
        selectedDatasetIds: signal(new Set<string>())
      };

      Object.defineProperty(app, 'filters', {
        value: signal(mockFilters),
        writable: true,
        configurable: true
      });

      Object.defineProperty(app, 'listing', {
        value: signal(mockListing),
        writable: true,
        configurable: true
      });

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(app).toBeTruthy();
    });

    it('should listen for document clicks', () => {
      const spyNext = jest
        .spyOn(clicks.documentClickedTarget, 'next')
        .mockImplementation();
      const el = fixture.debugElement.query(By.css('*'));

      el.nativeElement.click();
      expect(clicks.documentClickedTarget.next).toHaveBeenCalled();

      app.documentClick({
        target: {
          nativeElement: { contains: () => false }
        } as unknown as HTMLElement
      });
      expect(spyNext).toHaveBeenCalledTimes(2);
    });

    it('should download datasets and map run IDs correctly', () => {
      jest.spyOn(api, 'getDownload');

      mockListing.form = {
        value: { check_ids: { '123': false } }
      } as unknown as FormGroup;

      mockListing.clioInfo.set({
        datasetChecks: { x: { list: [{ id: 123 } as ClioCheck] } }
      });

      app.downloadDataset('x');

      expect(mockFilters.getDataServerDataRequest).toHaveBeenCalled();
      expect(api.getDownload).toHaveBeenCalled();
    });

    it('should download all', () => {
      jest.spyOn(api, 'getDownload');
      mockListing.form = formVals;
      app.downloadAll();

      expect(mockFilters.getDataServerDataRequest).toHaveBeenCalled();
      expect(api.getDownload).toHaveBeenCalled();
    });

    it('should compile an accurate exclusions map inside downloadAll loops', () => {
      jest.spyOn(api, 'getDownload').mockImplementation(() => undefined);

      mockListing.clioInfo.set({
        list: [{ id: 10 }, { id: 20 }, { id: 30 }]
      } as any);

      const activeSelections = new Set<number>([20]);
      (mockListing as any).selectedCheckIds = signal(activeSelections);

      app.downloadAll();

      expect(api.getDownload).toHaveBeenCalledWith(
        expect.objectContaining({
          excluded_check_ids: ['10', '30']
        })
      );
    });

    it('should download checking records by precise single ID', () => {
      jest.spyOn(api, 'getDownload');
      app.downloadCheck(1);
      expect(api.getDownload).toHaveBeenCalled();
    });

    it('should drop the page configuration and let route sync handle loading', () => {
      app.loadPrevPage();
      expect(mockFilters.dropPage).toHaveBeenCalledTimes(1);
    });

    it('should bump the page configuration and let route sync handle loading', () => {
      app.loadNextPage();
      expect(mockFilters.bumpPage).toHaveBeenCalledTimes(1);
    });

    it('should react to the page params (datasetName)', () => {
      jest.spyOn(app.filters(), 'dropPage').mockImplementation(() => undefined);
      mockQueryParams$.next({ datasetName: 'my_dataset' });
      fixture.detectChanges();

      expect(app.canLoadPrevPageSignal()).toBeFalsy();
    });

    it('should determine if can load prev page based on URL route query state', () => {
      expect(app.canLoadPrevPageSignal()).toBeFalsy();

      mockQueryParams$.next({ offset: 50, limit: 10 });
      fixture.detectChanges();
      expect(app.canLoadPrevPageSignal()).toBeTruthy();

      mockQueryParams$.next({ offset: 0, limit: 100 });
      fixture.detectChanges();
      expect(app.canLoadPrevPageSignal()).toBeFalsy();
    });

    it('should compute the correct visual page string text via the reactive query params stream', () => {
      mockQueryParams$.next({ offset: 0, limit: 25 });
      fixture.detectChanges();
      expect(app.paginationText()).toBe('0 - 25');

      mockQueryParams$.next({ offset: 50, limit: 10 });
      fixture.detectChanges();
      expect(app.paginationText()).toBe('50 - 60');
    });
  });
});
