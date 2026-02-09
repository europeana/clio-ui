import { apiSettings } from '../../environments/apisettings';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { APIService } from './';
import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';

describe('API Service', () => {
  let service: APIService;
  let httpTesting: HttpTestingController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
    service = TestBed.inject(APIService);
    httpTesting = TestBed.inject(HttpTestingController);
  }));

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should get the filtered reports', () => {
    service
      .getFilteredReports({
        filters: {}
      })
      .subscribe((data: unknown) => {
        expect(data).toBeTruthy();
      });
  });

  it('should get the download', () => {
    const url = `${apiSettings.serverAPI}/download`;
    service.getDownload({
      filters: {},
      excluded_run_ids: []
    });
    const req = httpTesting.expectOne(url, 'post...');
    req.flush('csv');
    httpTesting.verify();
  });
});
