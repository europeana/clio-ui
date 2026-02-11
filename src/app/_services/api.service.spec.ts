import { apiSettings } from '../../environments/apisettings';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';

import { Run } from '../_models';
import { APIService } from './';

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

  it('should group the runs', () => {
    const grouped = service.groupRuns([
      {
        datasetId: 1
      },
      {
        datasetId: 1
      },
      {
        datasetId: 2
      }
    ] as unknown as Array<Run>);
    expect(grouped.length).toEqual(2);
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
