import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
import { ListingComponent } from './listing';

describe('AppComponent', () => {
  let clicks: ClickService;
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let api: APIService;
  let mockQueryParams$: BehaviorSubject<Params>;

  const formVals = {
    value: {
      check_ids: ['1'],
      offset: 0,
      limit: 5
    }
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
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: mockQueryParams$
          }
        }
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
      app.filters = {
        getDataServerDataRequest: jest.fn().mockReturnValue({ filters: {} })
      } as unknown as FiltersComponent;

      jest.spyOn(app.filters, 'getDataServerDataRequest');
      jest.spyOn(api, 'getDownload');

      app.listing = {
        form: {
          value: {
            check_ids: { '123': false }
          }
        } as unknown as FormGroup,
        clioInfo: () => {
          return {
            datasetChecks: {
              x: {
                list: [{ id: 123 } as ClioCheck]
              }
            }
          };
        }
      } as unknown as ListingComponent;

      app.downloadDataset('x');

      expect(app.filters.getDataServerDataRequest).toHaveBeenCalled();
      expect(api.getDownload).toHaveBeenCalled();
    });

    it('should download all', () => {
      jest.spyOn(api, 'getDownload');

      app.listing = {
        form: formVals
      } as unknown as ListingComponent;

      app.filters = {
        getDataServerDataRequest: jest.fn(),
        form: formVals
      } as unknown as FiltersComponent;

      app.downloadAll();
      expect(app.filters.getDataServerDataRequest).toHaveBeenCalled();
      expect(api.getDownload).toHaveBeenCalled();
    });

    it('should download checking records by precise single ID', () => {
      jest.spyOn(api, 'getDownload');
      app.downloadCheck(1);
      expect(api.getDownload).toHaveBeenCalled();
    });

    it('should drop the page configuration and let route sync handle loading', () => {
      app.filters = {
        dropPage: jest.fn()
      } as any;

      app.loadPrevPage();
      expect(app.filters.dropPage).toHaveBeenCalledTimes(1);
    });

    it('should bump the page configuration and let route sync handle loading', () => {
      app.filters = {
        bumpPage: jest.fn()
      } as any;

      app.loadNextPage();
      expect(app.filters.bumpPage).toHaveBeenCalledTimes(1);
    });

    it('should determine if can load prev page based on child dynamic form state', () => {
      app.filters = { form: undefined } as any;
      expect(app.canLoadPrevPage()).toBeFalsy();

      app.filters = {
        form: {
          value: { offset: '50', limit: '10' }
        }
      } as any;
      expect(app.canLoadPrevPage()).toBeTruthy();

      app.filters = {
        form: {
          value: { offset: '0', limit: '100' }
        }
      } as any;
      expect(app.canLoadPrevPage()).toBeFalsy();
    });

    it('should compute the correct visual page string text via the reactive query params stream', fakeAsync(() => {
      expect(app.paginationText()).toBe('0 - 25');
      mockQueryParams$.next({ offset: 50, limit: 10 });
      tick(0);
      fixture.detectChanges();
      expect(app.paginationText()).toBe('50 - 60');
    }));
  });
});
