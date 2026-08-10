import { CUSTOM_ELEMENTS_SCHEMA, signal, WritableSignal } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
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

  // Track shared mock spies globally across the suite context
  let mockFilters: {
    hasMoreAvailable: WritableSignal<boolean>;
    form: FormGroup;
    getDataServerDataRequest: jest.Mock;
    dropPage: jest.Mock;
    bumpPage: jest.Mock;
  };

  // Track shared mock listing structures reactively
  let mockListing: {
    form: FormGroup;
    clioInfo: WritableSignal<Record<string, unknown>>;
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

      // Centralized Filters Mock Setup
      mockFilters = {
        hasMoreAvailable: signal(false),
        form: formVals,
        getDataServerDataRequest: jest.fn().mockReturnValue({ filters: {} }),
        dropPage: jest.fn(),
        bumpPage: jest.fn()
      };

      // Centralized Listing Mock Setup using a real writable signal for clioInfo
      mockListing = {
        form: formVals,
        clioInfo: signal({ datasetChecks: {} })
      };

      // Inject the filters viewChild signal cleanly
      Object.defineProperty(app, 'filters', {
        value: signal(mockFilters),
        writable: true,
        configurable: true
      });

      // Inject the listing viewChild signal cleanly to avoid TS2540 compilation errors
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

    it('should listen for document clicks', fakeAsync(() => {
      const spyNext = jest
        .spyOn(clicks.documentClickedTarget, 'next')
        .mockImplementation();
      const el = fixture.debugElement.query(By.css('*'));
      el.nativeElement.click();
      tick(1);
      expect(clicks.documentClickedTarget.next).toHaveBeenCalled();

      app.documentClick({
        target: {
          nativeElement: { contains: () => false }
        } as unknown as HTMLElement
      });
      expect(spyNext).toHaveBeenCalledTimes(2);
    }));

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

    it('should determine if can load prev page based on URL route query state', fakeAsync(() => {
      expect(app.canLoadPrevPageSignal()).toBeFalsy();

      mockQueryParams$.next({ offset: 50, limit: 10 });
      tick(0);
      fixture.detectChanges();
      expect(app.canLoadPrevPageSignal()).toBeTruthy();

      mockQueryParams$.next({ offset: 0, limit: 100 });
      tick(0);
      fixture.detectChanges();
      expect(app.canLoadPrevPageSignal()).toBeFalsy();
    }));

    it('should compute the correct visual page string text via the reactive query params stream', fakeAsync(() => {
      // 1. Set the mock dataset values through the real signal payload channel
      mockListing.clioInfo.set({
        datasetChecks: {
          'dataset-1': { list: [] },
          'dataset-2': { list: [] }
        }
      });

      // 2. Force change detection so the parent computed blocks re-evaluate
      fixture.detectChanges();

      // Since we have 2 datasets (less than the limit of 25), maxBound becomes 0 + 2 = 2
      expect(app.paginationText()).toBe('0 - 2');

      // 3. Update query parameters stream (offset: 50, limit: 10)
      mockQueryParams$.next({ offset: 50, limit: 10 });
      tick(0);
      fixture.detectChanges();

      // Since we have 2 datasets (less than the limit of 10), maxBound becomes 50 + 2 = 52
      expect(app.paginationText()).toBe('50 - 52');
    }));
  });
});
