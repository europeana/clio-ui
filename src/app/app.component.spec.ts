import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import {
  MockAPIService,
  MockAPIServiceErrors,
  MockFiltersComponent
} from './_mocked';
import { APIService, ClickService } from './_services';

import { AppComponent } from './app.component';
import { FiltersComponent } from './filters';
import { ListingComponent } from './listing';

describe('AppComponent', () => {
  let clicks: ClickService;
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let api: APIService;

  const formVals = {
    value: {
      check_ids: ['1'],
      offset: 0,
      limit: 5
    }
  } as unknown as FormGroup;

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: APIService,
          useClass: errorMode ? MockAPIServiceErrors : MockAPIService
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

    it('should download datasets', () => {
      jest.spyOn(app.filters, 'getDataServerDataRequest');
      jest.spyOn(api, 'getDownload');
      app.listing = {
        form: {
          value: {
            check_ids: ['1'],
            offset: 0,
            limit: 5
          }
        } as unknown as FormGroup,
        clioInfo: () => {
          return {
            datasetChecks: {
              x: {
                list: []
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
  });
});
