import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { apiSettings } from '../../environments/apisettings-ci';
import { APIService } from './';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

describe('API Service', () => {
  let service: APIService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        APIService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    service = TestBed.inject(APIService);
  }));

  it('should load availableReports', () => {
    const spyLoadAvailableReports = jest.spyOn(service, 'availableReports');
    const sub = service.availableReports().subscribe((res) => {
      expect(res).toBeTruthy();
      sub.unsubscribe();
    });
    expect(spyLoadAvailableReports).toHaveBeenCalled();
  });

  it('should load batches', () => {
    const spyBatches = jest.spyOn(service, 'batches');
    const sub = service.batches().subscribe((res) => {
      expect(res).toBeTruthy();
      sub.unsubscribe();
    });
    expect(spyBatches).toHaveBeenCalled();
  });

  it('should load the latest report', () => {
    const spyLatestReport = jest.spyOn(service, 'latestReport');
    const sub = service.latestReport().subscribe((res) => {
      expect(res).toBeTruthy();
      sub.unsubscribe();
    });
    expect(spyLatestReport).toHaveBeenCalled();
  });

  it('should load the report by batch id', () => {
    const spyReportByBatchId = jest.spyOn(service, 'reportByBatchId');
    const sub = service.reportByBatchId('x').subscribe((res) => {
      expect(res).toBeTruthy();
      sub.unsubscribe();
    });
    expect(spyReportByBatchId).toHaveBeenCalled();
  });
});
