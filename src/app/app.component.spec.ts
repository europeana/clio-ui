import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';

import { AppComponent } from './app.component';
import { APIService, ExportCSVService } from './_services';
import { MockAPIService, MockAPIServiceErrors } from './_mocked';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let csv: ExportCSVService;

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: APIService,
          useClass: errorMode ? MockAPIServiceErrors : MockAPIService
        }
      ]
    }).compileComponents();
    csv = TestBed.inject(ExportCSVService);
  };

  describe('Normal Operations', () => {
    beforeEach((): void => {
      configureTestbed();
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      component.showSwaggerEndpoints = true;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should loadReportByBatchId', () => {
      component.loadReportByBatchId();
      expect(component).toBeTruthy();
    });

    it('should downloadReportByBatchId', () => {
      jest.spyOn(component, 'loadReportByBatchId');
      jest.spyOn(csv, 'download');
      component.downloadReportByBatchId();
      expect(component.loadReportByBatchId).toHaveBeenCalled();
      expect(csv.download).toHaveBeenCalled();
    });

    it('should loadLatestReport', () => {
      component.loadLatestReport();
      expect(component).toBeTruthy();
    });

    it('should downloadLatestReport', () => {
      jest.spyOn(component, 'loadLatestReport');
      jest.spyOn(csv, 'download');
      component.downloadLatestReport();
      expect(component.loadLatestReport).toHaveBeenCalled();
      expect(csv.download).toHaveBeenCalled();
    });

    it('should loadBatches', () => {
      component.loadBatches();
      expect(component).toBeTruthy();
    });

    it('should downloadBatches', () => {
      jest.spyOn(component, 'loadBatches');
      jest.spyOn(csv, 'download');
      component.downloadBatches();
      expect(component.loadBatches).toHaveBeenCalled();
      expect(csv.download).toHaveBeenCalled();
    });

    it('should loadAvailableReports', () => {
      component.loadAvailableReports();
      expect(component).toBeTruthy();
    });

    it('should downloadAvailableReports', () => {
      jest.spyOn(component, 'loadAvailableReports');
      jest.spyOn(csv, 'download');
      component.downloadAvailableReports();
      expect(component.loadAvailableReports).toHaveBeenCalled();
      expect(csv.download).toHaveBeenCalled();
    });
  });

  describe('Errors', () => {
    beforeEach((): void => {
      configureTestbed(true);
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      component.showSwaggerEndpoints = true;
      fixture.detectChanges();
    });

    it('should handle errors with loadReportByBatchId', fakeAsync(() => {
      component.loadReportByBatchId();
      tick(1);
      expect(component.error).toBeTruthy();
    }));

    it('should handle errors with loadLatestReport', fakeAsync(() => {
      component.loadLatestReport();
      tick(1);
      expect(component.error).toBeTruthy();
    }));

    it('should handle errors with loadBatches', fakeAsync(() => {
      component.loadBatches();
      tick(1);
      expect(component.error).toBeTruthy();
    }));

    it('should handle errors with loadAvailableReports', fakeAsync(() => {
      component.loadAvailableReports();
      tick(1);
      expect(component.error).toBeTruthy();
    }));
  });
});
