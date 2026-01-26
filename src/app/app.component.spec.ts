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

import { MockAPIService, MockAPIServiceErrors } from './_mocked';
import { APIService, ClickService } from './_services';

import { AppComponent } from './app.component';
import { FiltersComponent } from './filters';
import { ListingComponent } from './listing';

describe('AppComponent', () => {
  let clicks: ClickService;
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let api: APIService;

  const configureTestbed = (errorMode = false): void => {
    console.log('errorMode = ' + errorMode + ', api ' + api);

    TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: APIService,
          useClass: errorMode ? MockAPIServiceErrors : MockAPIService
        }
      ]
    }).compileComponents();
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

    it('should download all', () => {
      jest.spyOn(api, 'getDownload');
      app.listing = {
        form: {
          value: {
            report_ids: ['1']
          }
        } as unknown as FormGroup
      } as unknown as ListingComponent;

      app.filters = {
        getDataServerDataRequest: jest.fn()
      } as unknown as FiltersComponent;

      app.downloadAll();
      expect(app.filters.getDataServerDataRequest).toHaveBeenCalled();
      expect(api.getDownload).toHaveBeenCalled();
    });
  });

  /*
  describe('Errors', () => {
    beforeEach((): void => {
      configureTestbed(true);
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      component.showSwaggerEndpoints = true;
      fixture.detectChanges();
    });
  });
  */
});
